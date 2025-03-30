import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "react-query";
import { apiRequest } from "./api";
import { toast } from "./use-toast";
import { navigate } from "hookrouter";
import { RegisterFormValues, LoginFormValues, loginSchema, registerSchema } from "./schemas";
import { Tabs, TabsList, TabsContent } from "./Tabs";

export function AuthPage() {
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await apiRequest({
        method: "POST",
        url: "/api/login",
        body: values,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Login successful!",
          description: "Welcome back to VIDIYOME.",
        });
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const { confirmPassword, ...registerData } = values;
      const response = await apiRequest({
        method: "POST",
        url: "/api/register",
        body: registerData,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Registration successful!",
          description: "Your account has been created. You can now log in.",
        });
        setActiveTab("login");
        registerForm.reset();
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "Please try again with different credentials.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit: SubmitHandler<LoginFormValues> = (values) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit: SubmitHandler<RegisterFormValues> = (values) => {
    registerMutation.mutate(values);
  };

  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">VIDIYOME</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Create, optimize and publish videos with AI
            </p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              {/* Tabs Content */}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
