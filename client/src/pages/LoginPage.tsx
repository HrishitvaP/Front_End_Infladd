import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [activeForm, setActiveForm] = useState<'login' | 'signup'>('login');
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        <Card className="rounded-xl glass-effect emboss-effect p-6 md:p-8">
          {/* Logo Area */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              <span className="text-primary">Secure</span>Login
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {activeForm === 'login' 
                ? 'Sign in to access your account' 
                : 'Create your account'}
            </p>
          </div>

          {/* Form Container */}
          <div className="flex flex-col space-y-4">
            {activeForm === 'login' ? (
              <LoginForm onSwitchForm={() => setActiveForm('signup')} />
            ) : (
              <SignupForm onSwitchForm={() => setActiveForm('login')} />
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SecureLogin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
