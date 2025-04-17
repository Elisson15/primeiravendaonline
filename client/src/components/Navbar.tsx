import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Loader2, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-2">
                PVO
              </div>
              <span className="text-primary font-heading font-bold text-lg hidden md:block">
                PrimeiraVendaOnline
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className={`px-3 py-2 text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
              Início
            </Link>
            <Link href="/cursos" className={`px-3 py-2 text-sm font-medium ${isActive('/cursos') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
              Cursos
            </Link>
            <a href="/#sobre" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary">
              Sobre
            </a>
            <a href="/#contato" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary">
              Contato
            </a>
            
            {isLoading ? (
              <Button size="sm" disabled className="ml-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-4">
                    <User className="h-4 w-4 mr-2" />
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/meus-cursos">Meus Cursos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/perfil">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saindo...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="ml-4">
                <Link href="/auth">Entrar</Link>
              </Button>
            )}
          </div>
          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-primary"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              <i className={`bx ${isMobileMenuOpen ? 'bx-x' : 'bx-menu'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/" 
            className={`block px-3 py-2 text-base font-medium ${isActive('/') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            onClick={closeMobileMenu}
          >
            Início
          </Link>
          <Link 
            href="/cursos" 
            className={`block px-3 py-2 text-base font-medium ${isActive('/cursos') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            onClick={closeMobileMenu}
          >
            Cursos
          </Link>
          <a 
            href="/#sobre" 
            className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
            onClick={closeMobileMenu}
          >
            Sobre
          </a>
          <a 
            href="/#contato" 
            className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
            onClick={closeMobileMenu}
          >
            Contato
          </a>
          
          {isLoading ? (
            <div className="px-3 py-2 text-base font-medium flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Carregando
            </div>
          ) : user ? (
            <>
              <div className="px-3 py-2 text-base font-medium text-primary">
                Olá, {user.username}
              </div>
              <Link 
                href="/meus-cursos"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                onClick={closeMobileMenu}
              >
                Meus Cursos
              </Link>
              <Link 
                href="/perfil"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                onClick={closeMobileMenu}
              >
                Meu Perfil
              </Link>
              <button
                className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700"
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="block px-3 py-2 text-base font-medium text-primary font-semibold"
              onClick={closeMobileMenu}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
