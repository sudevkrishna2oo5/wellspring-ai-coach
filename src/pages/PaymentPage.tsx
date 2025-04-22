
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, CreditCard, CheckCircle2, X, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const professionalId = searchParams.get('professional');
  
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  
  // Form schema for payment validation
  const formSchema = z.object({
    cardNumber: z.string()
      .min(16, "Card number must be 16 digits")
      .max(16, "Card number must be 16 digits")
      .regex(/^\d+$/, "Card number must contain only digits"),
    cardName: z.string().min(3, "Cardholder name is required"),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
    cvv: z.string()
      .min(3, "CVV must be 3 or 4 digits")
      .max(4, "CVV must be 3 or 4 digits")
      .regex(/^\d+$/, "CVV must contain only digits"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: ""
    },
  });
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session);
      
      if (!data.session) {
        navigate('/auth');
      }
    };
    
    getSession();
    
    // Fetch professional data based on ID from URL
    // In a real app, this would fetch from the API. Here, we're using mock data.
    if (professionalId) {
      // Simulate API call
      setTimeout(() => {
        const mockProfessionals = [
          {
            id: '1',
            name: 'Dr. Rahul Sharma',
            specialty: 'Nutrition Specialist',
            price: 499,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop'
          },
          {
            id: '2',
            name: 'Priya Patel',
            specialty: 'Fitness Coach',
            price: 399,
            image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=300&h=300&auto=format&fit=crop'
          },
          {
            id: '3',
            name: 'Vikram Singh',
            specialty: 'Physical Therapist',
            price: 599,
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&h=300&auto=format&fit=crop'
          },
          {
            id: '4',
            name: 'Anjali Gupta',
            specialty: 'Yoga Instructor',
            price: 349,
            image: 'https://images.unsplash.com/photo-1593164842264-854604db2260?q=80&w=300&h=300&auto=format&fit=crop'
          },
          {
            id: '5',
            name: 'Dr. Rajesh Kumar',
            specialty: 'Sports Medicine',
            price: 799,
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&auto=format&fit=crop'
          },
          {
            id: '6',
            name: 'Deepika Malhotra',
            specialty: 'Dietitian',
            price: 449,
            image: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?q=80&w=300&h=300&auto=format&fit=crop'
          }
        ];
        
        const foundProfessional = mockProfessionals.find(p => p.id === professionalId);
        if (foundProfessional) {
          setProfessional(foundProfessional);
        } else {
          toast("Professional not found");
          navigate('/professional-advice');
        }
      }, 300);
    } else {
      navigate('/professional-advice');
    }
  }, [navigate, professionalId]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    
    // In a real app, this would send payment info to a secure payment processor
    // Here, we're just simulating a payment process
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated successful payment
      setPaymentSuccess(true);
      
      // In a real app, you would save the booking to your database here
      // await supabase.from('bookings').insert([
      //   {
      //     user_id: userSession?.user.id,
      //     professional_id: professional.id,
      //     amount: professional.price,
      //     status: 'paid'
      //   }
      // ]);
      
      toast("Payment successful! Your session is booked.");
    } catch (error) {
      toast("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatCardNumber = (input: string) => {
    // Remove all non-digit characters
    const value = input.replace(/\D/g, '');
    return value.substring(0, 16);
  };
  
  const formatExpiryDate = (input: string) => {
    // Remove all non-digit characters
    const value = input.replace(/\D/g, '');
    // Format as MM/YY
    if (value.length > 2) {
      return `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    return value;
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16 flex items-center justify-center">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6">
            Your consultation with {professional?.name} has been booked. You will receive a confirmation email shortly with details on how to connect.
          </p>
          <Button 
            className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }
  
  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16">
      <motion.header 
        className="py-4 px-6 flex items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          className="mr-2 text-white hover:bg-white/10" 
          onClick={() => navigate('/professional-advice')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Payment</h1>
      </motion.header>

      <main className="container mx-auto px-4 pt-6 pb-24 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={professional.image} 
                alt={professional.name} 
                className="w-16 h-16 rounded-full object-cover" 
              />
              <div>
                <h3 className="text-lg font-semibold">{professional.name}</h3>
                <p className="text-sm text-violet-500">{professional.specialty}</p>
                <div className="mt-1 text-lg font-semibold">
                  ₹{professional.price} <span className="text-sm font-normal text-muted-foreground">per session</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Payment Details</h2>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Secure Payment</span>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234 5678 9012 3456" 
                          {...field}
                          value={formatCardNumber(field.value)}
                          onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                          maxLength={16}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Smith" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM/YY" 
                            {...field}
                            value={formatExpiryDate(field.value)}
                            onChange={(e) => {
                              const formatted = formatExpiryDate(e.target.value);
                              field.onChange(formatted);
                            }}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            {...field}
                            maxLength={4}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span>₹{professional.price}</span>
                  </div>
                  <div className="flex justify-between mb-4 text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>₹{Math.round(professional.price * 0.18)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{professional.price + Math.round(professional.price * 0.18)}</span>
                  </div>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentPage;
