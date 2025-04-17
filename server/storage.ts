import { 
  users, type User, type InsertUser, 
  courses, type Course, type InsertCourse,
  testimonials, type Testimonial, type InsertTestimonial,
  features, type Feature, type InsertFeature,
  modules, type Module, type InsertModule,
  lessons, type Lesson, type InsertLesson,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  enrollments, type Enrollment, type InsertEnrollment,
  progress, type Progress, type InsertProgress,
  reviews, type Review, type InsertReview,
  orders, type Order, type InsertOrder
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Module methods
  getModulesByCourseId(courseId: number): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  
  // Lesson methods
  getLessonsByModuleId(moduleId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Quiz Question methods
  getQuizQuestionsByLessonId(lessonId: number): Promise<QuizQuestion[]>;
  getQuizQuestion(id: number): Promise<QuizQuestion | undefined>;
  createQuizQuestion(quizQuestion: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // Enrollment methods
  getEnrollmentsByUserId(userId: number): Promise<Enrollment[]>;
  getEnrollmentByCourseAndUserId(courseId: number, userId: number): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined>;
  
  // Progress methods
  getProgressByUserId(userId: number): Promise<Progress[]>;
  getProgressByLessonAndUserId(lessonId: number, userId: number): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(id: number, progressData: Partial<Progress>): Promise<Progress | undefined>;
  
  // Review methods
  getReviewsByCourseId(courseId: number): Promise<Review[]>;
  getReviewByUserAndCourseId(userId: number, courseId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Order methods
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined>;

  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Feature methods
  getFeatures(): Promise<Feature[]>;
  createFeature(feature: InsertFeature): Promise<Feature>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private modules: Map<number, Module>;
  private lessons: Map<number, Lesson>;
  private quizQuestions: Map<number, QuizQuestion>;
  private enrollments: Map<number, Enrollment>;
  private progressRecords: Map<number, Progress>;
  private reviews: Map<number, Review>;
  private orders: Map<number, Order>;
  private testimonials: Map<number, Testimonial>;
  private features: Map<number, Feature>;
  
  private currentUserId: number;
  private currentCourseId: number;
  private currentModuleId: number;
  private currentLessonId: number;
  private currentQuizQuestionId: number;
  private currentEnrollmentId: number;
  private currentProgressId: number;
  private currentReviewId: number;
  private currentOrderId: number;
  private currentTestimonialId: number;
  private currentFeatureId: number;
  
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.lessons = new Map();
    this.quizQuestions = new Map();
    this.enrollments = new Map();
    this.progressRecords = new Map();
    this.reviews = new Map();
    this.orders = new Map();
    this.testimonials = new Map();
    this.features = new Map();
    
    this.currentUserId = 1;
    this.currentCourseId = 1;
    this.currentModuleId = 1;
    this.currentLessonId = 1;
    this.currentQuizQuestionId = 1;
    this.currentEnrollmentId = 1;
    this.currentProgressId = 1;
    this.currentReviewId = 1;
    this.currentOrderId = 1;
    this.currentTestimonialId = 1;
    this.currentFeatureId = 1;
    
    // Create memory store for sessions
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      email: null,
      fullName: null,
      avatarUrl: null,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(
      (course) => course.slug === slug,
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const now = new Date();
    const course: Course = { 
      ...insertCourse, 
      id,
      createdAt: now,
      isPopular: insertCourse.isPopular || false
    };
    this.courses.set(id, course);
    return course;
  }
  
  // Module methods
  async getModulesByCourseId(courseId: number): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }
  
  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    const module: Module = { ...insertModule, id };
    this.modules.set(id, module);
    return module;
  }
  
  // Lesson methods
  async getLessonsByModuleId(moduleId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }
  
  // Quiz Question methods
  async getQuizQuestionsByLessonId(lessonId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter(question => question.lessonId === lessonId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    return this.quizQuestions.get(id);
  }
  
  async createQuizQuestion(insertQuizQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.currentQuizQuestionId++;
    const quizQuestion: QuizQuestion = { ...insertQuizQuestion, id };
    this.quizQuestions.set(id, quizQuestion);
    return quizQuestion;
  }

  // Certificate methods
  async getCertificatesByUserId(userId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values())
      .filter(cert => cert.userId === userId);
  }

  async getCertificateByCourseAndUserId(courseId: number, userId: number): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values())
      .find(cert => cert.courseId === courseId && cert.userId === userId);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = this.currentCertificateId++;
    const now = new Date();
    const certificate: Certificate = {
      ...insertCertificate,
      id,
      issuedAt: now,
      emailSent: false,
      emailSentAt: null
    };
    this.certificates.set(id, certificate);
    return certificate;
  }
  
  // Enrollment methods
  async getEnrollmentsByUserId(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.userId === userId);
  }
  
  async getEnrollmentByCourseAndUserId(courseId: number, userId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values())
      .find(enrollment => enrollment.courseId === courseId && enrollment.userId === userId);
  }
  
  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.currentEnrollmentId++;
    const now = new Date();
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id,
      enrolledAt: now,
      completedAt: null
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }
  
  async updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = await this.getEnrollment(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment = { ...enrollment, ...enrollmentData };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }
  
  private async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }
  
  // Progress methods
  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return Array.from(this.progressRecords.values())
      .filter(progress => progress.userId === userId);
  }
  
  async getProgressByLessonAndUserId(lessonId: number, userId: number): Promise<Progress | undefined> {
    return Array.from(this.progressRecords.values())
      .find(progress => progress.lessonId === lessonId && progress.userId === userId);
  }
  
  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.currentProgressId++;
    const now = new Date();
    const progressRecord: Progress = { 
      ...insertProgress, 
      id,
      completedAt: null,
      lastAccessedAt: now
    };
    this.progressRecords.set(id, progressRecord);
    return progressRecord;
  }
  
  async updateProgress(id: number, progressData: Partial<Progress>): Promise<Progress | undefined> {
    const progressRecord = await this.getProgress(id);
    if (!progressRecord) return undefined;
    
    const updatedProgress = { ...progressRecord, ...progressData };
    this.progressRecords.set(id, updatedProgress);
    return updatedProgress;
  }
  
  private async getProgress(id: number): Promise<Progress | undefined> {
    return this.progressRecords.get(id);
  }
  
  // Review methods
  async getReviewsByCourseId(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.courseId === courseId);
  }
  
  async getReviewByUserAndCourseId(userId: number, courseId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values())
      .find(review => review.courseId === courseId && review.userId === userId);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id,
      createdAt: now
    };
    this.reviews.set(id, review);
    return review;
  }
  
  // Order methods
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId);
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const now = new Date();
    const updatedOrder = { 
      ...order, 
      ...orderData,
      updatedAt: now
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialId++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Feature methods
  async getFeatures(): Promise<Feature[]> {
    return Array.from(this.features.values());
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const id = this.currentFeatureId++;
    const feature: Feature = { ...insertFeature, id };
    this.features.set(id, feature);
    return feature;
  }

  // Initialize data
  private initializeData() {
    // Create sample courses
    const coursesData: InsertCourse[] = [
      {
        title: "Curso Instagram para Vendas",
        description: "Aprenda a usar o Instagram para gerar leads qualificados e converter seguidores em clientes.",
        price: 19700, // in cents
        imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
        duration: 8, // hours
        level: "MAIS POPULAR",
        isPopular: true,
        slug: "instagram-para-vendas"
      },
      {
        title: "WhatsApp Estratégico",
        description: "Domine as técnicas de atendimento e vendas pelo WhatsApp e aumente sua taxa de conversão.",
        price: 14700, // in cents
        imageUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624",
        duration: 6, // hours
        level: "BÁSICO",
        isPopular: false,
        slug: "whatsapp-estrategico"
      },
      {
        title: "Design para Negócios",
        description: "Crie designs profissionais para suas redes sociais mesmo sem experiência prévia.",
        price: 22700, // in cents
        imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d",
        duration: 10, // hours
        level: "INTERMEDIÁRIO",
        isPopular: false,
        slug: "design-para-negocios"
      },
      {
        title: "Tráfego Pago Essencial",
        description: "Aprenda a criar campanhas eficientes no Facebook e Instagram Ads com baixo investimento.",
        price: 29700, // in cents
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        duration: 12, // hours
        level: "AVANÇADO",
        isPopular: false,
        slug: "trafego-pago-essencial"
      }
    ];

    const courseEntities = coursesData.map(course => this.createCourse(course));
    
    // Criar módulos para o curso de Instagram para Vendas
    Promise.resolve(courseEntities[0]).then(instagramCourse => {
      if (!instagramCourse) return;
      
      this.createModulesForInstagramCourse(instagramCourse.id);
    });

    // Create sample testimonials
    const testimonialsData: InsertTestimonial[] = [
      {
        name: "Ana Silva",
        courseTitle: "Curso Instagram para Vendas",
        content: "Em apenas 30 dias após aplicar as estratégias do curso, consegui fazer minha primeira venda online. O método é simples e direto ao ponto.",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        rating: 5
      },
      {
        name: "Carlos Mendes",
        courseTitle: "WhatsApp Estratégico",
        content: "Nunca imaginei que conseguiria vender pelo WhatsApp com tanta eficiência. O curso me ajudou a estruturar todo o processo de forma profissional.",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        rating: 5
      },
      {
        name: "Mariana Costa",
        courseTitle: "Tráfego Pago Essencial",
        content: "As aulas de tráfego pago me ajudaram a escalar meu negócio com um investimento mínimo. ROI de mais de 300% já na primeira campanha!",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        rating: 5
      }
    ];

    testimonialsData.forEach(testimonial => {
      this.createTestimonial(testimonial);
    });

    // Create sample features
    const featuresData: InsertFeature[] = [
      {
        title: "Metodologia Simplificada",
        description: "Sem complicações ou jargões, apenas estratégias diretas que funcionam mesmo para iniciantes.",
        icon: "bx-bulb"
      },
      {
        title: "Resultados Rápidos",
        description: "Conteúdo prático que permite você implementar e ver resultados em semanas, não meses.",
        icon: "bx-time"
      },
      {
        title: "Suporte Contínuo",
        description: "Acesso a comunidade exclusiva e suporte direto com nossos especialistas durante todo o processo.",
        icon: "bx-support"
      }
    ];

    featuresData.forEach(feature => {
      this.createFeature(feature);
    });
  }
  
  private async createModulesForInstagramCourse(courseId: number) {
    // Criando módulos para o curso de Instagram
    const moduleEntities = [
      {
        courseId,
        title: "Introdução ao Instagram para Negócios",
        description: "Aprenda os fundamentos do Instagram e como configurar sua conta comercial corretamente",
        order: 1
      },
      {
        courseId,
        title: "Criação de Conteúdo Estratégico",
        description: "Metodologias para criar conteúdos que engajam e convertem seguidores em clientes",
        order: 2
      },
      {
        courseId,
        title: "Estratégias de Crescimento Orgânico",
        description: "Como aumentar sua base de seguidores sem investir em anúncios pagos",
        order: 3
      },
      {
        courseId,
        title: "Vendas no Instagram",
        description: "Técnicas avançadas para converter seguidores em clientes pagantes",
        order: 4
      }
    ].map(module => this.createModule(module));
    
    // Aguarda a criação dos módulos
    const modules = await Promise.all(moduleEntities);
    
    // Criar lições para o primeiro módulo
    if (modules.length > 0) {
      const introModule = modules[0];
      this.createLessonsForIntroModule(introModule.id);
    }
  }
  
  private async createLessonsForIntroModule(moduleId: number) {
    // Lições para o módulo de introdução
    const lessonEntities = [
      {
        moduleId,
        title: "Por que o Instagram para vendas?",
        description: "Entenda por que o Instagram é uma das melhores plataformas para vender online",
        type: "video" as const,
        content: null,
        videoUrl: "https://www.youtube.com/watch?v=sample1",
        duration: 600, // 10 minutos
        order: 1
      },
      {
        moduleId,
        title: "Configurando sua conta comercial",
        description: "Passo a passo para configurar uma conta profissional no Instagram",
        type: "video" as const,
        content: null,
        videoUrl: "https://www.youtube.com/watch?v=sample2",
        duration: 720, // 12 minutos
        order: 2
      },
      {
        moduleId,
        title: "Otimizando seu perfil para vendas",
        description: "Como criar uma bio que converte e um feed atrativo",
        type: "video" as const,
        content: null,
        videoUrl: "https://www.youtube.com/watch?v=sample3",
        duration: 840, // 14 minutos
        order: 3
      },
      {
        moduleId,
        title: "Quiz: Fundamentos do Instagram",
        description: "Teste seus conhecimentos sobre os fundamentos do Instagram para negócios",
        type: "quiz" as const,
        content: null,
        videoUrl: null,
        duration: 300, // 5 minutos
        order: 4
      }
    ].map(lesson => this.createLesson(lesson));
    
    // Aguarda a criação das lições
    const lessons = await Promise.all(lessonEntities);
    
    // Criar perguntas para o quiz
    const quizLesson = lessons.find(lesson => lesson.type === "quiz");
    if (quizLesson) {
      this.createQuestionsForQuiz(quizLesson.id);
    }
  }
  
  private async createQuestionsForQuiz(lessonId: number) {
    // Perguntas para o quiz
    const questions = [
      {
        lessonId,
        question: "Qual é o principal benefício de usar uma conta comercial no Instagram?",
        options: [
          "Poder remover comentários negativos",
          "Acesso a insights e métricas de desempenho",
          "Poder bloquear outros perfis",
          "Poder enviar mais mensagens diretas"
        ],
        correctOption: 1, // A segunda opção (índice 1) é a correta
        explanation: "As contas comerciais permitem acesso a insights detalhados sobre seguidores e desempenho de publicações, essenciais para estratégias de marketing.",
        order: 1
      },
      {
        lessonId,
        question: "O que deve ser incluído na bio do Instagram para aumentar conversões?",
        options: [
          "Apenas seu nome completo",
          "Uma lista de todos seus produtos",
          "Uma chamada clara para ação (CTA)",
          "Muitos emojis e hashtags"
        ],
        correctOption: 2, // A terceira opção (índice 2) é a correta
        explanation: "Uma chamada para ação clara orienta os visitantes sobre qual deve ser o próximo passo, aumentando a chance de conversão.",
        order: 2
      },
      {
        lessonId,
        question: "Qual ferramenta do Instagram é mais eficaz para vendas diretas?",
        options: [
          "Stories",
          "IGTV",
          "Reels",
          "Shopping"
        ],
        correctOption: 3, // A quarta opção (índice 3) é a correta
        explanation: "O Instagram Shopping permite marcar produtos diretamente nas publicações, facilitando a jornada de compra.",
        order: 3
      }
    ].map(question => this.createQuizQuestion(question));
    
    await Promise.all(questions);
  }
}

export const storage = new MemStorage();
