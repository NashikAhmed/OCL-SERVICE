import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const OfficeLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordChangeLoading, setIsPasswordChangeLoading] = useState(false);
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before login
  const from = (location.state as any)?.from?.pathname || '/office/dashboard';

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/office/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if password change is required
        if (data.requiresPasswordChange) {
          setShowPasswordChange(true);
          setCurrentPassword(password);
          return;
        }
        
        // Save token and user info
        localStorage.setItem('officeToken', data.token);
        localStorage.setItem('officeUser', JSON.stringify(data.user));
        
        // Show welcome message if user has admin privileges
        if (data.user.adminInfo) {
          alert(`Welcome ${data.user.name}! You have admin privileges and can access admin features.`);
        }
        
        // Redirect to dashboard or intended page
        navigate(from, { replace: true });
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      alert('Google authentication failed. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/office/google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user info
        localStorage.setItem('officeToken', data.token);
        localStorage.setItem('officeUser', JSON.stringify(data.user));
        
        // Show welcome message if user has admin privileges
        if (data.user.adminInfo) {
          alert(`Welcome ${data.user.name}! You have admin privileges and can access admin features.`);
        }
        
        // Redirect to dashboard or intended page
        navigate(from, { replace: true });
      } else {
        alert(data.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert('Google authentication failed. Please try again.');
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }
    
    setIsPasswordChangeLoading(true);
    
    try {
      const response = await fetch('/api/office/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Password change successful, now auto-login with new password
        try {
          const loginResponse = await fetch('/api/office/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email, 
              password: newPassword
            }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            // Save token and user info
            localStorage.setItem('officeToken', loginData.token);
            localStorage.setItem('officeUser', JSON.stringify(loginData.user));
            
            // Show welcome message if user has admin privileges
            if (loginData.user.adminInfo) {
              alert(`Welcome ${loginData.user.name}! You have admin privileges and can access admin features.`);
            }
            
            // Redirect to dashboard or intended page
            navigate(from, { replace: true });
          } else {
            alert('Password changed successfully! Please login with your new password.');
            setShowPasswordChange(false);
            setNewPassword('');
            setConfirmPassword('');
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          alert('Password changed successfully! Please login with your new password.');
          setShowPasswordChange(false);
          setNewPassword('');
          setConfirmPassword('');
        }
      } else {
        alert(data.error || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsPasswordChangeLoading(false);
    }
  };

  // Password Change Modal
  if (showPasswordChange) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#edeef1] via-[#f0f2f5] to-[#e8eaed] flex items-center justify-center px-4 overflow-hidden">
        <div className="bg-white rounded-[20px] md:rounded-[30px] shadow-lg overflow-hidden w-full max-w-md">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Change Password</h2>
              <p className="text-gray-600">Please set a new password for your account</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={isNewPasswordHidden ? 'password' : 'text'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 pr-9"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setIsNewPasswordHidden(!isNewPasswordHidden)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    {isNewPasswordHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={isConfirmPasswordHidden ? 'password' : 'text'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 pr-9"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setIsConfirmPasswordHidden(!isConfirmPasswordHidden)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    {isConfirmPasswordHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button
                onClick={handlePasswordChange}
                disabled={isPasswordChangeLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 text-sm rounded-full transition-all duration-300"
              >
                {isPasswordChangeLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#edeef1] via-[#f0f2f5] to-[#e8eaed] flex items-center justify-center px-4 overflow-hidden">
      <div className="bg-white rounded-[20px] md:rounded-[30px] shadow-lg overflow-hidden w-full max-w-5xl h-[90vh] max-h-[600px] flex flex-col md:flex-row">

        {/* Left Side Image Section */}
        <div className="relative w-full md:w-1/2 hidden md:flex items-center justify-center bg-white px-6 rounded-l-[20px] md:rounded-l-[30px]">
          <div className="relative w-full h-full max-h-[510px] rounded-2xl overflow-hidden shadow-md">
            <img
              src="https://github.com/suraja9/FinalOcl/blob/main/Gemini_Generated_Image_u530eau530eau530.png?raw=true"
              alt="Office Background"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl"></div>
          </div>
        </div>

        {/* Right Side Form Section */}
        <div className="w-full md:w-1/2 p-6 md:px-8 md:py-6 flex flex-col justify-center overflow-y-auto relative">
          <div className="max-w-md mx-auto w-full px-4">
            {/* Logo positioned on border line */}
            <div className="w-full flex justify-center relative z-10 mb-4">
              <img
              style={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px' ,borderRadius: '50%'}}
                src="/assets/ocl-logo.jpg"
                alt="OCL Services"
                className="h-18 w-40 shadow-lg bg-white border-2 border-white/40"
              />
            </div>
            
            {/* Glassmorphic Card Container */}
            <div className="backdrop-blur-xl bg-white/25 border-l border-r border-b border-white/40 border-t-0 rounded-b-2xl px-14 py-6 hover:bg-white/30 backdrop-saturate-150 transition-all duration-300 -mt-8 pt-12" style={{ boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="peer pl-10 pr-4 py-2.5 text-sm rounded-full border border-gray-300/60 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] focus:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-h-[40px] transition-all duration-200"
                      style={{
                        boxShadow: email ? '0 4px 6px -1px rgba(0,0,0,0.1)' : undefined
                      }}
                    />
                    <Label
                      htmlFor="email"
                      className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
                      peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1
                      peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      Email ID/Mobile No.
                    </Label>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={isPasswordHidden ? 'password' : 'text'}
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="peer pl-10 pr-9 py-2.5 text-sm rounded-full border border-gray-300/60 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] focus:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-h-[40px] transition-all duration-200"
                      style={{
                        boxShadow: password ? '0 4px 6px -1px rgba(0,0,0,0.1)' : undefined
                      }}
                    />
                    <Label
                      htmlFor="password"
                      className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
                      peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1
                      peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setIsPasswordHidden(!isPasswordHidden)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      {isPasswordHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="accent-blue-600" />
                    <Label htmlFor="remember">Remember Me</Label>
                  </div>
                  <button type="button" className="text-blue-600 hover:underline">
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700/90 text-white font-medium py-2.5 text-sm rounded-full transition-all duration-300 min-h-[40px] shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              {/* Social Buttons */}
              <div className="space-y-1.5">
                <div className="relative">
                  <button className="flex items-center justify-center gap-2 border border-gray-300/60 bg-white/30 backdrop-blur-sm px-3 py-2.5 rounded-full hover:bg-white/40 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 text-sm w-full min-h-[40px] hover:scale-[1.02]">
                    <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-4 h-4" /> Sign in with Google
                  </button>
                  {/* Invisible GoogleLogin overlay */}
                  <div className="absolute inset-0 opacity-0">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                </div>
                <button className="flex items-center justify-center gap-2 border border-gray-300/60 bg-white/30 backdrop-blur-sm px-3 py-2.5 rounded-full hover:bg-white/40 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 text-sm w-full min-h-[40px] hover:scale-[1.02]">
                  <img src="https://i.pinimg.com/736x/b1/c7/c5/b1c7c5cfca2d45f915fd7b3d6113b391.jpg" alt="Apple" className="w-4 h-4" /> Sign in with Apple
                </button>
              </div>

            </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeLogin;