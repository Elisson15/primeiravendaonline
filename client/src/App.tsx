import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CourseLearn from "@/pages/CourseLearn";
import Checkout from "@/pages/Checkout";
import AuthPage from "@/pages/auth-page";
import MeusCursos from "@/pages/MeusCursos";
import Perfil from "@/pages/Perfil";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/cursos" component={Courses} />
          <Route path="/cursos/:slug" component={CourseDetail} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/meus-cursos" component={MeusCursos} />
          <ProtectedRoute path="/perfil" component={Perfil} />
          <ProtectedRoute path="/cursos/:slug/aprender" component={CourseLearn} />
          <ProtectedRoute path="/cursos/:slug/checkout" component={Checkout} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
