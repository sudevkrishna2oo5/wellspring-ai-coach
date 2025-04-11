
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Sparkles, ArrowRight, Mail, Lock, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Auth = () => {
  // State for email/password authentication
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for phone authentication
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  // Shared state
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "You've successfully logged in.",
        });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "Registration successful. Please check your email for confirmation.",
        });
      }
    } catch (error) {
      setErrorMsg(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Format phone number to E.164 format
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log("Sending OTP to formatted phone:", formattedPhone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      
      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "A verification code has been sent to your phone.",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMsg(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log("Verifying OTP for phone:", formattedPhone, "OTP:", otp);
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Phone verification successful.",
      });
      navigate('/');
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMsg(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format phone numbers to E.164 format
  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it already has the + prefix, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // If no country code and starts with 0, replace the leading 0 with country code
    if (digits.startsWith('0')) {
      return `+91${digits.substring(1)}`;  // Assuming India (+91) as default
    }
    
    // If 10 digits (no country code), add default country code
    if (digits.length === 10) {
      return `+91${digits}`;  // Assuming India (+91) as default
    }
    
    // For other cases, just add a + prefix
    return `+${digits}`;
  };

  const handleBackToPhoneInput = () => {
    setOtpSent(false);
    setOtp('');
    setErrorMsg('');
  };

  const renderEmailAuthForm = () => (
    <form onSubmit={handleEmailAuth}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        {errorMsg && (
          <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
            {errorMsg}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark transition-all duration-300 group"
          disabled={loading}
        >
          {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          type="button"
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </Button>
      </CardFooter>
    </form>
  );

  const renderPhoneForm = () => (
    <>
      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 (123) 456-7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Format: +91 for India or include your country code
              </p>
            </div>
            
            {errorMsg && (
              <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                {errorMsg}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark transition-all duration-300 group"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification Code"}
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-center text-lg font-medium">
              Verification code sent!
            </h3>
            <p className="text-center text-sm text-muted-foreground mb-4">
              We've sent a 6-digit code to {phoneNumber}
            </p>
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium">
                Enter Verification Code
              </Label>
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
            </div>
            
            {errorMsg && (
              <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md mt-2">
                {errorMsg}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark transition-all duration-300 group"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Login"}
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToPhoneInput}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to phone number
            </Button>
          </CardFooter>
        </form>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-dark/10 via-background to-indigo-dark/10">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT bg-clip-text text-transparent">
            FitVibe
          </h1>
          <p className="text-muted-foreground mt-2">
            Your complete wellness journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg gradient-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center">
                {isLogin ? "Welcome back" : "Create an account"}
                <Sparkles className="h-5 w-5 ml-2 text-violet-DEFAULT" />
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? "Enter your credentials to access your account" 
                  : "Enter your details to create your FitVibe account"}
              </CardDescription>
            </CardHeader>
            
            <Tabs 
              defaultValue="email" 
              value={authMethod}
              onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}
              className="w-full"
            >
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="email" disabled={loading}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" disabled={loading}>
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="email" className="pt-0">
                {renderEmailAuthForm()}
              </TabsContent>
              
              <TabsContent value="phone" className="pt-0">
                {renderPhoneForm()}
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
