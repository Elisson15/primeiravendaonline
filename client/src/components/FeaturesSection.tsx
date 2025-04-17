import { useQuery } from "@tanstack/react-query";
import { Feature } from "@shared/schema";
import FeatureCard from "./FeatureCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturesSection() {
  const { data: features, isLoading } = useQuery<Feature[]>({
    queryKey: ["/api/features"],
  });

  return (
    <section className="py-16 bg-white" id="features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4">
            Por que escolher a PVO?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Nossa metodologia foi desenvolvida para iniciantes que desejam resultados rápidos e sustentáveis no mercado digital.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-lg">
                <Skeleton className="w-16 h-16 rounded-full mb-4" />
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : (
            features?.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                title={feature.title} 
                description={feature.description} 
                icon={feature.icon} 
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
