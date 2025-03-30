import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Extended schema for form validation
const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and privacy policy"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const { registerMutation } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      terms: false
    }
  });

  const onSubmit = (data: SignupFormValues) => {
    // Remove confirmPassword and terms from submitted data
    const { confirmPassword, terms, ...submitData } = data;
    registerMutation.mutate(submitData);
  };

  const handleGoogleSignup = () => {
    toast({
      title: "Google signup",
      description: "Google OAuth signup is coming soon",
    });
  };

  const handleGithubSignup = () => {
    toast({
      title: "GitHub signup",
      description: "GitHub OAuth signup is coming soon",
    });
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first-name">
              First name
            </Label>
            <Input 
              type="text" 
              id="first-name" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              {...form.register("firstName")}
            />
            {form.formState.errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last-name">
              Last name
            </Label>
            <Input 
              type="text" 
              id="last-name" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              {...form.register("lastName")}
            />
            {form.formState.errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-email">
            Email
          </Label>
          <Input 
            type="email" 
            id="signup-email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
            Username
          </Label>
          <Input 
            type="text" 
            id="username" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            {...form.register("username")}
          />
          {form.formState.errors.username && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.username.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-password">
            Password
          </Label>
          <Input 
            type="password" 
            id="signup-password" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.</p>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">
            Confirm Password
          </Label>
          <Input 
            type="password" 
            id="confirm-password" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              {...form.register("terms")}
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </Label>
          </div>
          {form.formState.errors.terms && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.terms.message}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up...
            </>
          ) : "Sign Up"}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button 
            type="button" 
            variant="outline"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleGoogleSignup}
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Google
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleGithubSignup}
          >
            <FaGithub className="h-5 w-5 mr-2" />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
