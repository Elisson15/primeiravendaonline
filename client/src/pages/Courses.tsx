import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import CourseCard from "@/components/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";

export default function Courses() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  return (
    <>
      <Helmet>
        <title>Cursos | Primeira Venda Online</title>
      </Helmet>
      
      <div className="bg-gradient-to-r from-primary to-[#4a148c] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Nossos Cursos
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Explore nossos cursos projetados para ajudar você a fazer sua primeira venda online com confiança.
          </p>
        </div>
      </div>

      <div className="bg-[#F8F9FA] py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {courses?.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
