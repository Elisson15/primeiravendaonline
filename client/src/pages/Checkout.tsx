import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, ShoppingCart, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Course = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: number;
  level: string;
  slug: string;
};

// Make sure to call `loadStripe` outside of a component's render
// to avoid recreating the `Stripe` object on every render.
// Usando chave de teste temporária para desenvolvimento
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

function CheckoutForm({ course }: { course: Course }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/cursos/${course.slug}`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Ocorreu um erro no pagamento.");
      setProcessing(false);
      toast({
        title: "Erro no pagamento",
        description: submitError.message || "Ocorreu um erro no pagamento.",
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setSucceeded(true);
      setProcessing(false);
      toast({
        title: "Pagamento realizado com sucesso!",
        description: "Você agora tem acesso ao curso.",
      });
      
      // Redirect to course page after a short delay
      setTimeout(() => {
        setLocation(`/cursos/${course.slug}`);
      }, 2000);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Erro no pagamento</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {succeeded ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">Pagamento concluído com sucesso!</h3>
          <p className="text-green-700 mb-4">Você já tem acesso ao curso.</p>
          <Button asChild>
            <Link href={`/cursos/${course.slug}`}>Acessar o curso</Link>
          </Button>
        </div>
      ) : (
        <>
          <PaymentElement />
          
          <Button 
            type="submit" 
            disabled={processing || !stripe || !elements} 
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Finalizar pagamento de R$ {(course.price / 100).toFixed(2).replace(".", ",")}
              </>
            )}
          </Button>
        </>
      )}
    </form>
  );
}

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isProcessing) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comprar um curso.",
        variant: "destructive",
      });
      setLocation(`/auth?redirect=/cursos/${slug}/checkout`);
    }
  }, [user, slug, setLocation, toast, isProcessing]);
  
  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${slug}`],
    enabled: !!slug,
  });
  
  // Check if user is already enrolled
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<any[]>({
    queryKey: ['/api/enrollments'],
    enabled: !!user,
    initialData: [],
  });
  
  // Check if user is already enrolled in this course
  const isEnrolled = enrollments?.some((enrollment: any) => 
    enrollment.courseId === course?.id
  );
  
  // If user is already enrolled, redirect to course page
  useEffect(() => {
    if (isEnrolled && course) {
      toast({
        title: "Já matriculado",
        description: "Você já está matriculado neste curso.",
      });
      setLocation(`/cursos/${course.slug}`);
    }
  }, [isEnrolled, course, setLocation, toast]);
  
  // Create payment intent when course data is loaded
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!course || !user || isEnrolled) return;
      
      try {
        setIsProcessing(true);
        const response = await apiRequest(
          "POST", 
          `/api/courses/${course.id}/purchase`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Falha ao criar pagamento");
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Erro",
          description: err.message || "Ocorreu um erro ao preparar o pagamento.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    createPaymentIntent();
  }, [course, user, isEnrolled, toast]);
  
  // Loading state
  if (isLoadingCourse || isLoadingEnrollments || isProcessing) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-center text-lg">Preparando seu pagamento...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
          <p className="text-red-700 mb-6">
            {error || "Não foi possível carregar o curso solicitado."}
          </p>
          <Button asChild variant="outline">
            <Link href={slug ? `/cursos/${slug}` : "/cursos"}>Voltar</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!stripePromise) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Pagamentos indisponíveis</h2>
          <p className="text-amber-700 mb-6">
            O sistema de pagamentos está temporariamente indisponível. Por favor, tente novamente mais tarde.
          </p>
          <Button asChild variant="outline">
            <Link href={`/cursos/${slug}`}>Voltar ao curso</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Finalizar compra</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Course summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo da compra</CardTitle>
                <CardDescription>Detalhes do curso selecionado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div 
                    className="h-24 w-24 rounded-md bg-cover bg-center flex-shrink-0" 
                    style={{ backgroundImage: `url(${course.imageUrl})` }}
                  />
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.level} • {course.duration}h</p>
                    <p className="text-lg font-bold mt-2">
                      R$ {(course.price / 100).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>R$ {(course.price / 100).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between font-medium mt-4">
                    <span>Total</span>
                    <span>R$ {(course.price / 100).toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start space-y-2">
                <p className="text-xs text-gray-500">
                  Ao finalizar a compra, você terá acesso imediato a todo o conteúdo do curso.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/cursos/${slug}`}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Voltar ao curso
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Payment form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Dados de pagamento</CardTitle>
                <CardDescription>Preencha os dados do seu cartão para finalizar a compra</CardDescription>
              </CardHeader>
              <CardContent>
                {clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: { theme: 'stripe' } }}
                  >
                    <CheckoutForm course={course} />
                  </Elements>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-gray-500">Carregando opções de pagamento...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}