import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUserSchema, LoginUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface LoginFormProps {
  onSwitchForm: () => void;
}

export default function LoginForm({ onSwitchForm }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginUser) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Redirect to dashboard
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Input */}
      <div className="relative form-input-container">
        <Input
          type="email"
          id="loginEmail"
          placeholder=""
          {...register("email")}
          className="form-input-float w-full bg-gray-50/70 border border-gray-200 rounded-lg p-4 text-gray-800 placeholder-transparent transition-colors focus:outline-none"
        />
        <label
          htmlFor="loginEmail"
          className="input-label absolute left-4 top-4 text-gray-500 transition-transform origin-0 duration-200 ease-in-out pointer-events-none"
        >
          Email address
        </label>
        {errors.email && (
          <div className="text-red-500 text-xs mt-1">
            {errors.email.message}
          </div>
        )}
      </div>

      {/* Password Input */}
      <div className="relative form-input-container">
        <Input
          type="password"
          id="loginPassword"
          placeholder=""
          {...register("password")}
          className="form-input-float w-full bg-gray-50/70 border border-gray-200 rounded-lg p-4 text-gray-800 placeholder-transparent transition-colors focus:outline-none"
        />
        <label
          htmlFor="loginPassword"
          className="input-label absolute left-4 top-4 text-gray-500 transition-transform origin-0 duration-200 ease-in-out pointer-events-none"
        >
          Password
        </label>
        {errors.password && (
          <div className="text-red-500 text-xs mt-1">
            {errors.password.message}
          </div>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <a
          href="#"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 rounded-lg transition-colors duration-300 shadow-sm hover:shadow h-12"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        Sign In
      </Button>

      {/* Sign Up Prompt */}
      <div className="text-center mt-4">
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchForm}
            className="text-[#6D28D9] hover:text-[#6D28D9]/90 font-medium ml-1 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </form>
  );
}
