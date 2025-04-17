import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-2">
                PVO
              </div>
              <span className="font-heading font-bold text-lg">PrimeiraVendaOnline</span>
            </div>
            <p className="text-gray-400 mb-4">
              Transformando conhecimento em negócios digitais lucrativos.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Instagram">
                <i className="bx bxl-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="YouTube">
                <i className="bx bxl-youtube text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook">
                <i className="bx bxl-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="LinkedIn">
                <i className="bx bxl-linkedin text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/cursos" className="text-gray-400 hover:text-white transition">
                  Cursos
                </Link>
              </li>
              <li>
                <a href="/#sobre" className="text-gray-400 hover:text-white transition">
                  Sobre nós
                </a>
              </li>
              <li>
                <a href="/#contato" className="text-gray-400 hover:text-white transition">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Cursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cursos/instagram-para-vendas" className="text-gray-400 hover:text-white transition">
                  Instagram para Vendas
                </Link>
              </li>
              <li>
                <Link href="/cursos/whatsapp-estrategico" className="text-gray-400 hover:text-white transition">
                  WhatsApp Estratégico
                </Link>
              </li>
              <li>
                <Link href="/cursos/design-para-negocios" className="text-gray-400 hover:text-white transition">
                  Design para Negócios
                </Link>
              </li>
              <li>
                <Link href="/cursos/trafego-pago-essencial" className="text-gray-400 hover:text-white transition">
                  Tráfego Pago Essencial
                </Link>
              </li>
              <li>
                <Link href="/cursos" className="text-gray-400 hover:text-white transition">
                  Todos os cursos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="bx bx-envelope text-primary mr-2 mt-1"></i>
                <span className="text-gray-400">contato@primeiravaendaonline.com.br</span>
              </li>
              <li className="flex items-start">
                <i className="bx bx-phone text-primary mr-2 mt-1"></i>
                <span className="text-gray-400">(11) 99999-9999</span>
              </li>
              <li className="flex items-start">
                <i className="bx bx-map text-primary mr-2 mt-1"></i>
                <span className="text-gray-400">São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} PrimeiraVendaOnline. Todos os direitos reservados.
            </p>
            <div className="mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 text-sm hover:text-white transition mr-4">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
