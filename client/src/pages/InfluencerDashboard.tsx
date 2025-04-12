import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
}

export default function InfluencerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // If user is not an influencer, redirect to the appropriate dashboard
          if (userData.role !== 'influencer') {
            setLocation(userData.role === 'creator' ? '/creator' : '/dashboard');
          }
        } else {
          // If not authenticated, redirect to login
          setLocation('/');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [setLocation, toast]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        setLocation('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation('/');
    return null;
  }

  return (
    <div className="min-h-screen container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row gap-4 items-center">
          <Avatar className="h-24 w-24 border-2 border-primary">
            {user.profilePicture ? (
              <AvatarImage src={user.profilePicture} alt={user.name} />
            ) : (
              <AvatarFallback className="text-xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-block px-3 py-1 mt-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              Influencer
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="font-medium text-xl mb-4">Influencer Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Welcome to your influencer dashboard! Here you can manage your campaigns, track your performance, and connect with brands.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-lg text-purple-700">0</h4>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-lg text-blue-700">0</h4>
                  <p className="text-sm text-gray-600">Partnership Offers</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-medium text-lg text-green-700">$0</h4>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}