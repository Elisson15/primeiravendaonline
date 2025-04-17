import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary to-[#4a148c] text-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Faça sua primeira venda online com confiança
            </h1>
            <p className="text-lg sm:text-xl opacity-90 mb-8 leading-relaxed">
              Aprenda estratégias simples e eficazes para iniciar seu negócio digital e alcançar resultados reais.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild variant="secondary" size="lg" className="px-8 py-6 bg-white text-primary hover:bg-gray-100">
                <Link href="/cursos">
                  Ver Cursos
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="px-8 py-6 bg-white text-primary hover:bg-gray-100">
                <a href="#sobre">
                  Saiba Mais
                </a>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Pessoa trabalhando no laptop" 
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
