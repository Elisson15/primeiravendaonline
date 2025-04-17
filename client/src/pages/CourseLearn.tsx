import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ChevronLeft, CheckCircle, PlayCircle, BookOpen, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Course = {
  id: number;
  title: string;
  description: string;
  slug: string;
};

type Module = {
  id: number;
  title: string;
  description: string | null;
  order: number;
  courseId: number;
};

type Lesson = {
  id: number;
  title: string;
  description: string | null;
  type: "video" | "text" | "quiz";
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  moduleId: number;
};

type Progress = {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  completedAt: string | null;
  quizScore: number | null;
};

export default function CourseLearn() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  
  // Fetch course
  const { data: course, isLoading: isLoadingCourse, error: courseError } = useQuery<Course>({
    queryKey: [`/api/courses/${slug}`],
    enabled: !!slug,
  });
  
  // Fetch modules
  const { data: modules, isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: [`/api/courses/${course?.id}/modules`],
    enabled: !!course?.id,
  });
  
  // Fetch active module's lessons
  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/modules/${activeModuleId}/lessons`],
    enabled: !!activeModuleId,
  });
  
  // Fetch current lesson
  const { data: activeLesson, isLoading: isLoadingLesson } = useQuery<{lesson: Lesson, progress: Progress}>({
    queryKey: [`/api/lessons/${activeLessonId}`],
    enabled: !!activeLessonId && !!user,
  });
  
  // Set the active module when modules are loaded
  useEffect(() => {
    if (modules && modules.length > 0) {
      // Select first module by default
      const firstModule = modules.sort((a, b) => a.order - b.order)[0];
      setActiveModuleId(firstModule.id);
    }
  }, [modules]);
  
  // Set the active lesson when lessons are loaded
  useEffect(() => {
    if (lessons && lessons.length > 0) {
      // Find first incomplete lesson or select first lesson
      const sortedLessons = lessons.sort((a, b) => a.order - b.order);
      setActiveLessonId(sortedLessons[0].id);
    }
  }, [lessons]);
  
  // Calculate overall progress
  useEffect(() => {
    const calculateProgress = async () => {
      if (!course?.id || !user) return;
      
      try {
        const res = await apiRequest("GET", `/api/enrollments`);
        const enrollments = await res.json();
        
        const courseEnrollment = enrollments.find((e: any) => e.courseId === course.id);
        if (courseEnrollment) {
          setOverallProgress(courseEnrollment.progress);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    };
    
    calculateProgress();
  }, [course, user]);
  
  // Mark lesson as complete
  const markLessonComplete = async () => {
    if (!activeLessonId || !user) return;
    
    try {
      const res = await apiRequest("POST", `/api/lessons/${activeLessonId}/complete`);
      
      if (res.ok) {
        toast({
          title: "Lição concluída",
          description: "Seu progresso foi atualizado.",
        });
        
        // Go to next lesson if available
        if (lessons) {
          const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
          if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
            setActiveLessonId(lessons[currentIndex + 1].id);
          } else if (modules) {
            // Try to go to the next module's first lesson
            const currentModuleIndex = modules.findIndex(m => m.id === activeModuleId);
            if (currentModuleIndex >= 0 && currentModuleIndex < modules.length - 1) {
              const nextModule = modules[currentModuleIndex + 1];
              setActiveModuleId(nextModule.id);
              // setActiveLessonId will be handled by the useEffect when lessons load
            } else {
              // Completed the course
              toast({
                title: "Curso concluído!",
                description: "Parabéns por finalizar o curso!",
              });
            }
          }
        }
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível marcar a lição como concluída.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to mark lesson as complete:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar seu progresso.",
        variant: "destructive",
      });
    }
  };
  
  // Loading states
  if (isLoadingCourse || isLoadingModules) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Error state
  if (courseError || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Curso não encontrado</h2>
          <p className="text-red-700 mb-4">Não foi possível carregar o curso solicitado.</p>
          <Button asChild variant="outline">
            <Link href="/cursos">Voltar para cursos</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 lg:max-w-xs">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mb-4"
              >
                <Link href={`/cursos/${slug}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar ao curso
                </Link>
              </Button>
              <h1 className="text-xl font-bold mb-1">{course.title}</h1>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do curso</span>
                  <span className="font-medium">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-2 text-sm font-medium text-gray-500">Conteúdo do curso</div>
            
            {modules && modules.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={activeModuleId?.toString()}
                onValueChange={(value) => setActiveModuleId(parseInt(value))}
              >
                {modules
                  .sort((a, b) => a.order - b.order)
                  .map((module) => (
                    <AccordionItem key={module.id} value={module.id.toString()}>
                      <AccordionTrigger className="text-sm font-medium py-2">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        {isLoadingLessons && module.id === activeModuleId ? (
                          <div className="py-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          </div>
                        ) : (
                          <ul className="space-y-1 py-1">
                            {lessons
                              ?.filter((lesson) => lesson.moduleId === module.id)
                              .sort((a, b) => a.order - b.order)
                              .map((lesson) => {
                                const isActive = lesson.id === activeLessonId;
                                const isComplete = activeLesson?.progress?.completed;
                                
                                let IconComponent;
                                if (lesson.type === "video") IconComponent = PlayCircle;
                                else if (lesson.type === "text") IconComponent = FileText;
                                else IconComponent = HelpCircle;
                                
                                return (
                                  <li key={lesson.id}>
                                    <button
                                      onClick={() => setActiveLessonId(lesson.id)}
                                      className={cn(
                                        "w-full flex items-center text-xs rounded-md py-1.5 px-2 text-left",
                                        isActive
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "hover:bg-gray-100 text-gray-700"
                                      )}
                                    >
                                      <IconComponent className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                                      <span className="truncate">{lesson.title}</span>
                                      {isComplete && (
                                        <CheckCircle className="h-3.5 w-3.5 ml-2 text-green-500 flex-shrink-0" />
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                          </ul>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            ) : (
              <div className="py-4 text-center text-gray-500">
                <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Não há módulos disponíveis para este curso.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {isLoadingLesson || !activeLesson ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-gray-500">Carregando conteúdo...</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">{activeLesson.lesson.title}</h2>
                
                {activeLesson.lesson.description && (
                  <p className="text-gray-600 mb-6">{activeLesson.lesson.description}</p>
                )}
                
                {activeLesson.lesson.type === "video" && activeLesson.lesson.videoUrl ? (
                  <div className="mb-8 aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={activeLesson.lesson.videoUrl.replace("watch?v=", "embed/")}
                      allowFullScreen
                      className="w-full h-full"
                      title={activeLesson.lesson.title}
                    ></iframe>
                  </div>
                ) : activeLesson.lesson.type === "text" && activeLesson.lesson.content ? (
                  <div 
                    className="prose max-w-none mb-8" 
                    dangerouslySetInnerHTML={{ __html: activeLesson.lesson.content }}
                  />
                ) : activeLesson.lesson.type === "quiz" ? (
                  <div className="mb-8 py-8 px-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-6">Quiz: {activeLesson.lesson.title}</h3>
                    <p className="text-gray-600 mb-4">
                      Este quiz ajudará a fixar o conteúdo aprendido até agora.
                    </p>
                    <Button 
                      asChild
                      variant="outline"
                      className="mt-4"
                    >
                      <Link href={`/cursos/${slug}/quiz/${activeLesson.lesson.id}`}>
                        Iniciar Quiz
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mb-8 py-8 px-6 bg-gray-50 rounded-lg text-center">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Conteúdo Indisponível</h3>
                    <p className="text-gray-600">
                      O conteúdo desta lição ainda não está disponível.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = lessons?.findIndex(l => l.id === activeLessonId) ?? -1;
                      if (currentIndex > 0 && lessons) {
                        setActiveLessonId(lessons[currentIndex - 1].id);
                      }
                    }}
                    disabled={
                      !lessons || 
                      lessons.findIndex(l => l.id === activeLessonId) <= 0
                    }
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <Button
                    onClick={markLessonComplete}
                    disabled={activeLesson.progress?.completed}
                  >
                    {activeLesson.progress?.completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluído
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como concluído
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = lessons?.findIndex(l => l.id === activeLessonId) ?? -1;
                      if (currentIndex >= 0 && lessons && currentIndex < lessons.length - 1) {
                        setActiveLessonId(lessons[currentIndex + 1].id);
                      }
                    }}
                    disabled={
                      !lessons || 
                      lessons.findIndex(l => l.id === activeLessonId) >= lessons.length - 1
                    }
                  >
                    Próximo
                    <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}