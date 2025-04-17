import { useQuery } from "@tanstack/react-query";
import { Testimonial } from "@shared/schema";
import TestimonialCard from "./TestimonialCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-medium">DEPOIMENTOS</span>
          <h2 className="font-heading text-3xl font-bold text-gray-900 mt-2 mb-4">
            O que dizem nossos alunos
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Histórias reais de pessoas que transformaram seus negócios com nossas estratégias.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#F8F9FA] p-6 rounded-lg">
                <Skeleton className="h-4 w-28 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <div className="flex items-center">
                  <Skeleton className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            testimonials?.map((testimonial) => (
              <TestimonialCard 
                key={testimonial.id} 
                name={testimonial.name}
                courseTitle={testimonial.courseTitle}
                content={testimonial.content}
                avatarUrl={testimonial.avatarUrl}
                rating={testimonial.rating}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
