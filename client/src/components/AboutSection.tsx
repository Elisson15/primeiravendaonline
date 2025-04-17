export default function AboutSection() {
  return (
    <section id="sobre" className="py-16 bg-[#F8F9FA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <span className="text-primary font-medium">SOBRE NÓS</span>
            <h2 className="font-heading text-3xl font-bold text-gray-900 mt-2 mb-6">
              Quem está por trás da Primeira Venda Online?
            </h2>
            <p className="text-gray-600 mb-6">
              A PVO nasceu da necessidade de simplificar o processo de vendas online para iniciantes. Nosso fundador, após anos trabalhando com marketing digital, percebeu que muitas pessoas desistiam por acharem o processo complexo demais.
            </p>
            <p className="text-gray-600 mb-6">
              Desenvolvemos uma metodologia simplificada que permite qualquer pessoa, mesmo sem experiência prévia, conseguir resultados reais em seu negócio digital.
            </p>
            <div className="flex items-center space-x-6 mt-8">
              <a href="#" className="text-primary hover:text-[#4a148c] transition" aria-label="Instagram">
                <i className="bx bxl-instagram text-2xl"></i>
              </a>
              <a href="#" className="text-primary hover:text-[#4a148c] transition" aria-label="YouTube">
                <i className="bx bxl-youtube text-2xl"></i>
              </a>
              <a href="#" className="text-primary hover:text-[#4a148c] transition" aria-label="Facebook">
                <i className="bx bxl-facebook text-2xl"></i>
              </a>
              <a href="#" className="text-primary hover:text-[#4a148c] transition" aria-label="LinkedIn">
                <i className="bx bxl-linkedin text-2xl"></i>
              </a>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Equipe PVO" 
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
