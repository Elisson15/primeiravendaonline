import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Course } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, BookOpen, PlayCircle, Loader2 } from "lucide-react";

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: ["/api/courses", slug],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${slug}`);
      if (!res.ok) throw new Error("Curso não encontrado");
      return res.json();
    },
  });
  
  // Check if user is enrolled in this course
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<any[]>({
    queryKey: ['/api/enrollments'],
    enabled: !!user,
    initialData: [],
  });
  
  // Check if user is already enrolled in this course
  const isEnrolled = enrollments?.some((enrollment: any) => 
    enrollment.courseId === course?.id
  );
  
  // Get enrollment if user is enrolled
  const enrollment = enrollments?.find((enrollment: any) => 
    enrollment.courseId === course?.id
  );
  
  // Handle enrollment (purchase or free enrollment)
  const handleEnroll = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para se matricular em um curso",
      });
      setLocation(`/auth?redirect=/cursos/${slug}`);
      return;
    }
    
    if (course?.price === 0) {
      // Handle free course enrollment
      enrollInFreeCourse();
    } else {
      // Handle paid course enrollment
      setLocation(`/cursos/${slug}/checkout`);
    }
  };
  
  // Enroll in a free course
  const enrollInFreeCourse = async () => {
    if (!course) return;
    
    try {
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao se matricular no curso");
      }
      
      toast({
        title: "Matriculado com sucesso!",
        description: "Agora você pode acessar o conteúdo do curso.",
      });
      
      // Refresh enrollments data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível realizar a matrícula",
        variant: "destructive",
      });
    }
  };

  if (isLoadingCourse || isLoadingEnrollments) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-80 w-full rounded-lg" />
            <div>
              <Skeleton className="h-10 w-1/3 mb-4" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-8" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
        <p className="mb-8">O curso que você está procurando não está disponível.</p>
        <Button asChild>
          <a href="/cursos">Ver todos os cursos</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{course.title} | Primeira Venda Online</title>
      </Helmet>
      
      <div className="bg-gradient-to-r from-primary to-[#4a148c] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {course.title}
          </h1>
          <p className="text-lg opacity-90 max-w-2xl">
            {course.description}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <img 
              src={`${course.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`} 
              alt={course.title} 
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className={`${course.isPopular ? 'bg-primary bg-opacity-10 text-primary' : 'bg-[#BB86FC] bg-opacity-10 text-[#4a148c]'} text-xs font-semibold px-2 py-1 rounded`}>
                {course.level}
              </span>
              <span className="text-[#03DAC5] font-semibold text-xl">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(course.price / 100)}
              </span>
            </div>
            
            <h2 className="font-heading text-2xl font-bold mb-4">
              Detalhes do curso
            </h2>
            
            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <i className="bx bx-time text-primary mr-2"></i>
                <span>{course.duration} horas de conteúdo</span>
              </li>
              <li className="flex items-center">
                <i className="bx bx-calendar text-primary mr-2"></i>
                <span>Acesso vitalício</span>
              </li>
              <li className="flex items-center">
                <i className="bx bx-devices text-primary mr-2"></i>
                <span>Disponível em qualquer dispositivo</span>
              </li>
              <li className="flex items-center">
                <i className="bx bx-certificate text-primary mr-2"></i>
                <span>Certificado de conclusão</span>
              </li>
            </ul>
            
            {isLoadingEnrollments ? (
              <Button className="w-full py-6 text-lg" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </Button>
            ) : isEnrolled ? (
              <Button 
                className="w-full py-6 text-lg"
                asChild
              >
                <Link href={`/cursos/${slug}/aprender`}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {enrollment?.progress ? 'Continuar curso' : 'Começar curso'}
                </Link>
              </Button>
            ) : (
              <Button 
                className="w-full py-6 text-lg"
                onClick={handleEnroll}
              >
                {course.price === 0 ? (
                  <>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Matricular-se gratuitamente
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Comprar por {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(course.price / 100)}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-6">
            O que você vai aprender
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start">
                <i className="bx bx-check-circle text-primary text-xl mr-2 mt-0.5"></i>
                <span>
                  {[
                    "Como identificar seu público ideal para vendas",
                    "Criação de conteúdo que atrai clientes potenciais",
                    "Técnicas de copywriting para aumentar conversões",
                    "Estratégias de precificação para maximizar lucros",
                    "Automação de processos de venda",
                    "Análise de métricas para otimizar resultados"
                  ][i]}
                </span>
              </div>
            ))}
          </div>
          
          <h2 className="font-heading text-2xl font-bold mb-6">
            Conteúdo do curso
          </h2>
          
          <div className="space-y-4 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 font-medium flex justify-between items-center">
                  <span>Módulo {i + 1}: {["Introdução", "Estratégias Básicas", "Técnicas Avançadas", "Otimização e Escalabilidade"][i]}</span>
                  <span className="text-sm text-gray-500">{[3, 4, 5, 4][i]} aulas</span>
                </div>
                <div className="p-4 space-y-2">
                  {[...Array([3, 4, 5, 4][i])].map((_, j) => (
                    <div key={j} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                      <i className="bx bx-play-circle text-primary mr-2"></i>
                      <span>Aula {j + 1}: Exemplo de título de aula para o módulo {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
