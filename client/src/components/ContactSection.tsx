import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  subject: z.string().min(1, { message: "Selecione um assunto" }),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log(data);
      toast({
        title: "Mensagem enviada",
        description: "Entraremos em contato em breve!",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contato" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-medium">CONTATO</span>
          <h2 className="font-heading text-3xl font-bold text-gray-900 mt-2 mb-4">
            Fale conosco
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tire suas dúvidas e descubra como podemos ajudar você a iniciar sua jornada de vendas online.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-600">Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-600">E-mail</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-600">Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel className="text-sm font-medium text-gray-600">Assunto</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-md">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="course">Dúvidas sobre cursos</SelectItem>
                        <SelectItem value="support">Suporte técnico</SelectItem>
                        <SelectItem value="partnership">Parcerias</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-sm font-medium text-gray-600">Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="col-span-2 text-center">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3"
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
