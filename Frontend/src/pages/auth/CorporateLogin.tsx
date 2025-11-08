import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building, Eye, EyeOff, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CorporateLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if corporate is already logged in
  useEffect(() => {
    const token = localStorage.getItem('corporateToken');
    const corporateInfo = localStorage.getItem('corporateInfo');
    
    if (token && corporateInfo) {
      try {
        const corporate = JSON.parse(corporateInfo);
        // Check if it's first login
        if (corporate.isFirstLogin) {
          navigate('/corporate/change-password');
        } else {
          navigate('/corporate/dashboard');
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('corporateToken');
        localStorage.removeItem('corporateInfo');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/corporate/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('corporateToken', data.token);
        localStorage.setItem('corporateInfo', JSON.stringify(data.corporate));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.corporate.companyName}!`,
        });
        
        // Check if it's first login
        if (data.corporate.isFirstLogin) {
          navigate('/corporate/change-password');
        } else {
          navigate('/corporate/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Corporate Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access your corporate dashboard with your credentials
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username / Email / Phone
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username, email, or phone number"
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span className="text-blue-600 font-medium">
                  Contact your administrator
                </span>
              </p>
            </div>
            
            <div className="w-full border-t border-gray-200 pt-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Use the credentials sent to your registered email
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble logging in?{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CorporateLogin;
