import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, LogOut, RefreshCw } from 'lucide-react';
import { 
  isAdminLoggedIn, 
  getStoredAdminInfo, 
  getStoredToken, 
  clearAuthData, 
  isTokenExpired, 
  getTimeUntilExpiry 
} from '@/utils/auth';

const SessionTest = () => {
  const [sessionInfo, setSessionInfo] = useState({
    isLoggedIn: false,
    adminInfo: null as any,
    token: null as string | null,
    isExpired: false,
    timeLeft: 0
  });

  const updateSessionInfo = () => {
    setSessionInfo({
      isLoggedIn: isAdminLoggedIn(),
      adminInfo: getStoredAdminInfo(),
      token: getStoredToken(),
      isExpired: isTokenExpired(),
      timeLeft: getTimeUntilExpiry()
    });
  };

  useEffect(() => {
    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const handleClearSession = () => {
    clearAuthData();
    updateSessionInfo();
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    const s = Math.floor(((hours % 1) * 60 % 1) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Status Test
          </CardTitle>
          <CardDescription>
            Test persistent login functionality and session management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Login Status</h4>
              <Badge variant={sessionInfo.isLoggedIn ? "default" : "destructive"}>
                {sessionInfo.isLoggedIn ? "Logged In" : "Not Logged In"}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Token Status</h4>
              <Badge variant={sessionInfo.isExpired ? "destructive" : "default"}>
                {sessionInfo.isExpired ? "Expired" : "Valid"}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Session Time Left</h4>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {sessionInfo.timeLeft > 0 ? formatTime(sessionInfo.timeLeft) : "Expired"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Admin Info</h4>
              <div className="text-sm text-gray-600">
                {sessionInfo.adminInfo ? (
                  <div>
                    <p><strong>Name:</strong> {sessionInfo.adminInfo.name}</p>
                    <p><strong>Email:</strong> {sessionInfo.adminInfo.email}</p>
                    <p><strong>Role:</strong> {sessionInfo.adminInfo.role}</p>
                  </div>
                ) : (
                  "No admin info stored"
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Token (First 20 chars)</h4>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded">
              {sessionInfo.token ? `${sessionInfo.token.substring(0, 20)}...` : "No token"}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={updateSessionInfo} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button onClick={handleClearSession} variant="destructive" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Clear Session
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Test Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Login to admin dashboard</li>
              <li>2. Close the browser completely</li>
              <li>3. Reopen the browser and navigate to admin dashboard</li>
              <li>4. You should be automatically logged in without re-entering credentials</li>
              <li>5. Session will expire after 24 hours</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionTest;
