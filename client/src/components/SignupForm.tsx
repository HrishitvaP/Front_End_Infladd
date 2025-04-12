import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface SignupFormProps {
  onSwitchForm: () => void;
}

// Extend the insertUserSchema to include confirmPassword and terms
const signupFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupForm({ onSwitchForm }: SignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create form data to send file
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      toast({
        title: "Success",
        description: "Account created successfully! You can now log in.",
      });
      
      // Switch to login form
      onSwitchForm();
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


      {/* Full Name Input */}
      <div className="relative form-input-container">
        <Input
          type="text"
          id="signupName"
          placeholder=""
          {...register("name")}
          className="form-input-float w-full bg-gray-50/70 border border-gray-200 rounded-lg p-4 text-gray-800 placeholder-transparent transition-colors focus:outline-none"
        />
        <label
          htmlFor="signupName"
          className="input-label absolute left-4 top-4 text-gray-500 transition-transform origin-0 duration-200 ease-in-out pointer-events-none"
        >
          Full Name
        </label>
        {errors.name && (
          <div className="text-red-500 text-xs mt-1">
            {errors.name.message}
          </div>
        )}
      </div>

      {/* Email Input */}
      <div className="relative form-input-container">
        <Input
          type="email"
          id="signupEmail"
          placeholder=""
          {...register("email")}
          className="form-input-float w-full bg-gray-50/70 border border-gray-200 rounded-lg p-4 text-gray-800 placeholder-transparent transition-colors focus:outline-none"
        />
        <label
          htmlFor="signupEmail"
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
          id="signupPassword"
          placeholder=""
          {...register("password")}
          className="form-input-float w-full bg-gray-50/70 border border-gray-200 rounded-lg p-4 text-gray-800 placeholder-transparent transition-colors focus:outline-none"
        />
        <label
          htmlFor="signupPassword"
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

      {/* Confirm Password Input */}
      <div className="relative form-input-container">
        <Input
          type="password"
          id="confirmPassword"
          placeholder=""
          {...register("confirmPassword")}
          className="form-input-float w-full bg-gray-50/70 border border-gray-200 rounded-lg p-4 text-gray-800 placeholder-transparent transition-colors focus:outline-none"
        />
        <label
          htmlFor="confirmPassword"
          className="input-label absolute left-4 top-4 text-gray-500 transition-transform origin-0 duration-200 ease-in-out pointer-events-none"
        >
          Confirm Password
        </label>
        {errors.confirmPassword && (
          <div className="text-red-500 text-xs mt-1">
            {errors.confirmPassword.message}
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          {...register("terms")}
          onCheckedChange={(checked) => {
            setValue("terms", checked === true);
          }}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className="text-xs font-medium text-gray-700 leading-tight"
          >
            I agree to the{" "}
            <a href="#" className="text-primary hover:text-primary/90">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:text-primary/90">
              Privacy Policy
            </a>
          </Label>
          {errors.terms && (
            <div className="text-red-500 text-xs">
              {errors.terms.message}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#6D28D9] hover:bg-opacity-90 text-white font-medium py-6 rounded-lg transition-colors duration-300 shadow-sm hover:shadow h-12"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        Create Account
      </Button>

      {/* Sign In Prompt */}
      <div className="text-center mt-4">
        <p className="text-gray-600 text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchForm}
            className="text-primary hover:text-primary/90 font-medium ml-1 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}
