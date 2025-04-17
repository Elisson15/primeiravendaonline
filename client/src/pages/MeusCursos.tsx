import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlayCircle, CheckCircle, PauseCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

type EnrolledCourse = {
  id: number;
  status: "active" | "completed" | "paused" | null;
  progress: number;
  courseId: number;
  userId: number;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    level: string;
    duration: number;
    slug: string;
  };
};

export default function MeusCursos() {
  const { user } = useAuth();
  
  const { data: enrollments, isLoading, error } = useQuery<EnrolledCourse[]>({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-center text-lg">Carregando seus cursos...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar cursos</h2>
          <p className="text-red-700">Não foi possível carregar seus cursos. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }
  
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Meus Cursos</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Você ainda não está matriculado em nenhum curso</h2>
          <p className="text-gray-600 mb-6">Explore nossa variedade de cursos e comece sua jornada de aprendizado hoje mesmo.</p>
          <Button asChild size="lg">
            <Link href="/cursos">Ver cursos disponíveis</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Meus Cursos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id} className="overflow-hidden flex flex-col h-full">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: `url(${enrollment.course.imageUrl})` }}
            />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-1">
                <Badge variant={
                  enrollment.status === "completed" ? "secondary" : 
                  enrollment.status === "paused" ? "outline" : "default"
                }>
                  {enrollment.status === "completed" ? "Concluído" : 
                   enrollment.status === "paused" ? "Pausado" : "Em andamento"}
                </Badge>
                <span className="text-sm text-gray-500">
                  {enrollment.course.duration}h
                </span>
              </div>
              <CardTitle className="text-xl">{enrollment.course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {enrollment.course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-grow">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild className="w-full" variant={enrollment.status === "completed" ? "outline" : "default"}>
                <Link href={`/cursos/${enrollment.course.slug}/aprender`}>
                  {enrollment.status === "completed" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Revisar curso
                    </>
                  ) : enrollment.progress > 0 ? (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continuar curso
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Começar curso
                    </>
                  )}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}