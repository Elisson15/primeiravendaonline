import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl mx-auto">
          Está pronto para fazer sua primeira venda online?
        </h2>
        <p className="text-white text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de alunos que já transformaram seus conhecimentos em um negócio digital lucrativo.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button asChild variant="secondary" size="lg" className="px-8 py-6 bg-white text-primary hover:bg-gray-100">
            <Link href="/cursos">
              Começar agora
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 border-white text-white hover:bg-white/10">
            <a href="#contato">
              Falar com consultor
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
