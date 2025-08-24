import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle, Users, HelpCircle, Send } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
  category: z.enum(["general", "support", "partnership", "feedback"]),
});

type ContactForm = z.infer<typeof contactSchema>;

const contactOptions = [
  {
    icon: Mail,
    title: "General Inquiries",
    description: "Questions about Artisan platform and features",
    value: "general",
  },
  {
    icon: HelpCircle,
    title: "Support",
    description: "Technical issues and account help",
    value: "support",
  },
  {
    icon: Users,
    title: "Partnerships",
    description: "Business partnerships and collaborations",
    value: "partnership",
  },
  {
    icon: MessageCircle,
    title: "Feedback",
    description: "Suggestions and feature requests",
    value: "feedback",
  },
];

export default function Contact() {
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: "general",
    },
  });

  const onSubmit = async (data: ContactForm) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    reset();
    setSelectedCategory("general");
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-display">Get in Touch</h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions, suggestions, or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Options */}
            <div className="space-y-4">
              <h2 className="text-heading">What can we help you with?</h2>
              <div className="space-y-3">
                {contactOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedCategory === option.value
                          ? "ring-2 ring-primary shadow-soft"
                          : "hover:shadow-soft"
                      }`}
                      onClick={() => setSelectedCategory(option.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-sm">{option.title}</h3>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Contact Info */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-heading">Other ways to reach us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Email</p>
                    <p className="text-caption text-muted-foreground">support@artisan.app</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Community</p>
                    <p className="text-caption text-muted-foreground">
                      Join our Discord for real-time help and discussions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Response Time</p>
                    <p className="text-caption text-muted-foreground">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-heading">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <input
                      type="hidden"
                      {...register("category")}
                      value={selectedCategory}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          {...register("name")}
                          className="focus-ring"
                          aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          {...register("email")}
                          className="focus-ring"
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your inquiry"
                        {...register("subject")}
                        className="focus-ring"
                        aria-invalid={!!errors.subject}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        {...register("message")}
                        className="focus-ring resize-none"
                        aria-invalid={!!errors.message}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}