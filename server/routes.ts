import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import Stripe from "stripe";
import { insertEnrollmentSchema, insertProgressSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe = null;

try {
  if (STRIPE_SECRET_KEY) {
    stripe = new Stripe(STRIPE_SECRET_KEY, { 
      apiVersion: "2023-10-16" as any
    });
  } else {
    console.warn('Missing STRIPE_SECRET_KEY environment variable. Stripe payments will not work.');
  }
} catch (error) {
  console.warn('Error initializing Stripe:', error);
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API routes
  
  // ----------- COURSES -----------
  
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch courses: " + error.message });
    }
  });

  // Get a specific course by slug
  app.get("/api/courses/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const course = await storage.getCourseBySlug(slug);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch course: " + error.message });
    }
  });

  // ----------- MODULES -----------
  
  // Get modules for a course
  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const modules = await storage.getModulesByCourseId(courseId);
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching modules: " + error.message });
    }
  });
  
  // ----------- LESSONS -----------
  
  // Get lessons for a module
  app.get("/api/modules/:moduleId/lessons", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: "Invalid module ID" });
      }
      
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const lessons = await storage.getLessonsByModuleId(moduleId);
      res.json(lessons);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching lessons: " + error.message });
    }
  });
  
  // Get a specific lesson
  app.get("/api/lessons/:lessonId", isAuthenticated, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }
      
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      // Check if user has access to this lesson
      const module = await storage.getModule(lesson.moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const enrollment = await storage.getEnrollmentByCourseAndUserId(
        module.courseId, 
        req.user!.id
      );
      
      // If the user isn't enrolled in the course, they can't access the lesson
      if (!enrollment) {
        return res.status(403).json({ message: "User not enrolled in this course" });
      }
      
      // Update progress record
      let progressRecord = await storage.getProgressByLessonAndUserId(lessonId, req.user!.id);
      if (!progressRecord) {
        progressRecord = await storage.createProgress({
          userId: req.user!.id,
          lessonId,
          completed: false,
          quizScore: null,
        });
      } else {
        // Update last accessed time
        progressRecord = await storage.updateProgress(progressRecord.id, {
          lastAccessedAt: new Date()
        });
      }
      
      res.json({ lesson, progress: progressRecord });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching lesson: " + error.message });
    }
  });
  
  // Mark lesson as complete
  app.post("/api/lessons/:lessonId/complete", isAuthenticated, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }
      
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      let progressRecord = await storage.getProgressByLessonAndUserId(lessonId, req.user!.id);
      if (!progressRecord) {
        progressRecord = await storage.createProgress({
          userId: req.user!.id,
          lessonId,
          completed: true,
          quizScore: null,
        });
      } else {
        progressRecord = await storage.updateProgress(progressRecord.id, {
          completed: true,
          completedAt: new Date()
        });
      }
      
      // Update overall course progress
      const module = await storage.getModule(lesson.moduleId);
      if (module) {
        const enrollment = await storage.getEnrollmentByCourseAndUserId(
          module.courseId, 
          req.user!.id
        );
        
        if (enrollment) {
          // Calculate overall progress
          const lessons = await storage.getLessonsByModuleId(lesson.moduleId);
          const moduleIds = (await storage.getModulesByCourseId(module.courseId)).map(m => m.id);
          const allLessons = (await Promise.all(
            moduleIds.map(id => storage.getLessonsByModuleId(id))
          )).flat();
          
          const progress = await storage.getProgressByUserId(req.user!.id);
          const completedLessons = progress.filter(p => p.completed && allLessons.some(l => l.id === p.lessonId));
          
          const progressPercentage = Math.round((completedLessons.length / allLessons.length) * 100);
          
          await storage.updateEnrollment(enrollment.id, {
            progress: progressPercentage,
            ...(progressPercentage === 100 ? { 
              status: "completed", 
              completedAt: new Date() 
            } : {})
          });
        }
      }
      
      res.json(progressRecord);
    } catch (error: any) {
      res.status(500).json({ message: "Error completing lesson: " + error.message });
    }
  });
  
  // ----------- QUIZ QUESTIONS -----------
  
  // Get quiz questions for a lesson
  app.get("/api/lessons/:lessonId/quiz", isAuthenticated, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }
      
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      if (lesson.type !== "quiz") {
        return res.status(400).json({ message: "This lesson is not a quiz" });
      }
      
      const questions = await storage.getQuizQuestionsByLessonId(lessonId);
      
      // Remove correct answers from response
      const questionsForClient = questions.map(q => ({
        id: q.id,
        lessonId: q.lessonId,
        question: q.question,
        options: q.options,
        order: q.order,
      }));
      
      res.json(questionsForClient);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching quiz: " + error.message });
    }
  });
  
  // Submit quiz answers
  app.post("/api/lessons/:lessonId/quiz/submit", isAuthenticated, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }
      
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      if (lesson.type !== "quiz") {
        return res.status(400).json({ message: "This lesson is not a quiz" });
      }
      
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Invalid answers format" });
      }
      
      const questions = await storage.getQuizQuestionsByLessonId(lessonId);
      
      // Calculate score
      let correctCount = 0;
      const results = questions.map(question => {
        const userAnswer = answers.find((a: any) => a.questionId === question.id);
        const isCorrect = userAnswer && userAnswer.selectedOption === question.correctOption;
        if (isCorrect) correctCount++;
        
        return {
          questionId: question.id,
          isCorrect,
          correctOption: question.correctOption,
          explanation: question.explanation
        };
      });
      
      const score = Math.round((correctCount / questions.length) * 100);
      
      // Update progress
      let progressRecord = await storage.getProgressByLessonAndUserId(lessonId, req.user!.id);
      if (!progressRecord) {
        progressRecord = await storage.createProgress({
          userId: req.user!.id,
          lessonId,
          completed: true,
          quizScore: score,
        });
      } else {
        progressRecord = await storage.updateProgress(progressRecord.id, {
          completed: true,
          completedAt: new Date(),
          quizScore: score
        });
      }
      
      res.json({ 
        score,
        results,
        progress: progressRecord
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error submitting quiz: " + error.message });
    }
  });
  
  // ----------- ENROLLMENTS -----------
  
  // Get user's enrolled courses
  app.get("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByUserId(req.user!.id);
      
      // Get course details for each enrollment
      const enrolledCourses = await Promise.all(
        enrollments.map(async enrollment => {
          const course = await storage.getCourse(enrollment.courseId);
          return {
            ...enrollment,
            course
          };
        })
      );
      
      res.json(enrolledCourses);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching enrollments: " + error.message });
    }
  });
  
  // Enroll in a free course
  app.post("/api/courses/:courseId/enroll", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is already enrolled
      const existingEnrollment = await storage.getEnrollmentByCourseAndUserId(
        courseId, 
        req.user!.id
      );
      
      if (existingEnrollment) {
        return res.status(400).json({ message: "User already enrolled in this course" });
      }
      
      // Only allow free enrollment for courses with price 0
      if (course.price > 0) {
        return res.status(400).json({ message: "This course requires payment" });
      }
      
      const enrollment = await storage.createEnrollment({
        userId: req.user!.id,
        courseId,
        status: "active",
        progress: 0
      });
      
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(500).json({ message: "Error enrolling in course: " + error.message });
    }
  });
  
  // ----------- PAYMENTS -----------
  
  // Create payment intent for course purchase
  app.post("/api/courses/:courseId/purchase", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is already enrolled
      const existingEnrollment = await storage.getEnrollmentByCourseAndUserId(
        courseId, 
        req.user!.id
      );
      
      if (existingEnrollment) {
        return res.status(400).json({ message: "User already enrolled in this course" });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: course.price,
        currency: "brl",
        metadata: {
          courseId: course.id.toString(),
          userId: req.user!.id.toString(),
        },
      });
      
      // Create pending order
      const order = await storage.createOrder({
        userId: req.user!.id,
        courseId: course.id,
        amount: course.price,
        status: "pending",
        paymentMethod: "stripe",
        paymentId: paymentIntent.id,
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment: " + error.message });
    }
  });
  
  // Webhook for Stripe events
  app.post("/api/webhook/stripe", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }
    
    const payload = req.body;
    
    try {
      const event = payload;
      
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        
        // Find order by payment ID
        const orders = Array.from((storage as any).orders.values())
          .filter((order: any) => order.paymentId === paymentIntent.id);
        
        if (orders.length > 0) {
          const order = orders[0];
          
          // Update order status
          await storage.updateOrder(order.id, {
            status: "completed"
          });
          
          // Create enrollment
          await storage.createEnrollment({
            userId: order.userId,
            courseId: order.courseId,
            status: "active",
            progress: 0
          });
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(400).json({ message: error.message });
    }
  });
  
  // ----------- REVIEWS -----------
  
  // Get reviews for a course
  app.get("/api/courses/:courseId/reviews", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const reviews = await storage.getReviewsByCourseId(courseId);
      
      // Get user details for each review
      const reviewsWithUserDetails = await Promise.all(
        reviews.map(async review => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            username: user?.username,
            userAvatar: user?.avatarUrl
          };
        })
      );
      
      res.json(reviewsWithUserDetails);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching reviews: " + error.message });
    }
  });
  
  // Create a review for a course
  app.post("/api/courses/:courseId/reviews", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is enrolled in the course
      const enrollment = await storage.getEnrollmentByCourseAndUserId(
        courseId, 
        req.user!.id
      );
      
      if (!enrollment) {
        return res.status(403).json({ message: "User not enrolled in this course" });
      }
      
      // Check if user already reviewed this course
      const existingReview = await storage.getReviewByUserAndCourseId(
        req.user!.id,
        courseId
      );
      
      if (existingReview) {
        return res.status(400).json({ message: "User already reviewed this course" });
      }
      
      // Validate the review data
      const reviewSchema = insertReviewSchema.extend({
        rating: z.number().min(1).max(5),
        comment: z.string().min(3).max(500)
      });
      
      const validatedData = reviewSchema.parse({
        userId: req.user!.id,
        courseId,
        ...req.body
      });
      
      const review = await storage.createReview(validatedData);
      
      res.status(201).json(review);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating review: " + error.message });
    }
  });
  
  // ----------- CERTIFICATES -----------
  
  // Get user certificates
  app.get("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const certificates = await storage.getCertificatesByUserId(req.user!.id);
      res.json(certificates);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch certificates: " + error.message });
    }
  });

  // Generate certificate for completed course
  app.post("/api/courses/:courseId/certificate", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const enrollment = await storage.getEnrollmentByCourseAndUserId(courseId, req.user!.id);
      if (!enrollment || enrollment.status !== "completed") {
        return res.status(400).json({ message: "Course not completed" });
      }
      
      // Check if certificate already exists
      const existingCertificate = await storage.getCertificateByCourseAndUserId(courseId, req.user!.id);
      if (existingCertificate) {
        return res.status(400).json({ message: "Certificate already generated" });
      }
      
      // Generate unique certificate number
      const certificateNumber = `CERT-${courseId}-${req.user!.id}-${Date.now()}`;
      
      const certificate = await storage.createCertificate({
        userId: req.user!.id,
        courseId,
        certificateNumber,
      });
      
      res.status(201).json(certificate);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating certificate: " + error.message });
    }
  });

  // ----------- TESTIMONIALS & FEATURES -----------
  
  // Get all testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch testimonials: " + error.message });
    }
  });

  // Get all features
  app.get("/api/features", async (req, res) => {
    try {
      const features = await storage.getFeatures();
      res.json(features);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch features: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
