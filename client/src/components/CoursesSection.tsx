import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Course } from "@shared/schema";
import CourseCard from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  return (
    <section id="cursos" className="py-16 bg-[#F8F9FA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-medium">NOSSOS CURSOS</span>
          <h2 className="font-heading text-3xl font-bold text-gray-900 mt-2 mb-4">
            Comece sua jornada digital
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Cursos práticos desenvolvidos para quem deseja iniciar no mercado digital com estratégias que realmente funcionam.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
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
            ))
          ) : (
            courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/cursos" className="inline-flex items-center text-primary font-medium hover:underline">
            Ver todos os cursos 
            <i className="bx bx-right-arrow-alt ml-1"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
