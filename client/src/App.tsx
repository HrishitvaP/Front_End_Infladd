import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import InfluencerDashboard from "@/pages/InfluencerDashboard";
import SponsorDashboard from "@/pages/SponsorDashboard";
import { useEffect, useState } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          
          // If user is authenticated and trying to access login page, redirect to appropriate dashboard based on role
          if (location === '/') {
            if (userData.role === 'influencer') {
              setLocation('/influencer');
            } else if (userData.role === 'sponsor') {
              setLocation('/sponsor');
            } else {
              setLocation('/dashboard');
            }
          }
          
          // Redirect to correct dashboard if user tries to access wrong one
          if ((location === '/influencer' && userData.role !== 'influencer') ||
              (location === '/sponsor' && userData.role !== 'sponsor') ||
              (location === '/dashboard' && (userData.role === 'influencer' || userData.role === 'sponsor'))) {
            if (userData.role === 'influencer') {
              setLocation('/influencer');
            } else if (userData.role === 'sponsor') {
              setLocation('/sponsor');
            } else {
              setLocation('/dashboard');
            }
          }
        } else {
          setIsAuthenticated(false);
          // If user is not authenticated and trying to access protected routes, redirect to login
          if (location === '/dashboard' || location === '/influencer' || location === '/sponsor') {
            setLocation('/');
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [location, setLocation]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/influencer" component={InfluencerDashboard} />
      <Route path="/sponsor" component={SponsorDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
