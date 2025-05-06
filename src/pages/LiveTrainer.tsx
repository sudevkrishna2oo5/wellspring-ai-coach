
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNavbar from "@/components/BottomNavbar";
import { Clock, CreditCard, MessageCircle, Phone, Video, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LiveTrainer = () => {
  const [searchParams] = useSearchParams();
  const expertId = searchParams.get('expertId');
  const [expert, setExpert] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConnection, setActiveConnection] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<{ duration: number; price: number } | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [messages, setMessages] = useState<{sender: string; message: string; time: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadExpertData = async () => {
      setIsLoading(true);
      
      if (!expertId) {
        navigate('/payment');
        return;
      }

      try {
        const { data: expertData, error } = await supabase
          .from('experts')
          .select('*')
          .eq('id', expertId)
          .single();

        if (error) {
          throw error;
        }

        if (expertData) {
          setExpert(expertData);
        } else {
          navigate('/payment');
          toast({
            title: "Expert not found",
            description: "We couldn't find the trainer you're looking for",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching expert:", error);
        toast({
          title: "Error",
          description: "Failed to load trainer data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExpertData();
  }, [expertId, navigate, toast]);

  const rates = [
    { duration: 15, price: 400 },
    { duration: 30, price: 700 },
    { duration: 60, price: 1200 },
    { duration: 90, price: 1800 }
  ];

  const handleConnect = (type: string) => {
    if (!selectedRate) {
      toast({
        title: "Please select a duration",
        description: "Choose how long you want to connect with the trainer",
        variant: "destructive"
      });
      return;
    }
    
    setActiveConnection(type);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    setPaymentSuccess(true);
    
    const mockMeetingUrl = "https://meet.google.com/new";
    setMeetingUrl(mockMeetingUrl);
    
    // Record the session in the database
    const saveSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const sessionDate = new Date().toISOString();
        
        // Create payment record
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            amount: selectedRate?.price,
            status: 'completed',
            payment_method: 'credit_card',
            payment_details: { sessionType: activeConnection },
            currency: 'INR'
          })
          .select()
          .single();
          
        if (paymentError) throw paymentError;
        
        // Create session record
        const { error: sessionError } = await supabase
          .from('expert_sessions')
          .insert({
            expert_id: expertId,
            user_id: user.id,
            session_date: sessionDate,
            duration: selectedRate?.duration,
            meeting_link: mockMeetingUrl,
            payment_id: paymentData.id,
            status: 'in_progress'
          });
          
        if (sessionError) throw sessionError;
        
        toast({
          title: "Session started!",
          description: `You are now connected with ${expert.full_name}`,
        });
        
      } catch (error) {
        console.error('Error saving session:', error);
        toast({
          title: "Session Error",
          description: "We couldn't record your session. Please contact support.",
          variant: "destructive"
        });
      }
    };
    
    saveSession();
    
    // For chat, simulate incoming messages
    if (activeConnection === 'chat') {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'trainer',
          message: `Hello! I'm ${expert.full_name}. How can I help you today?`,
          time: new Date().toLocaleTimeString()
        }]);
      }, 1500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const userMessage = {
      sender: 'user',
      message: newMessage,
      time: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate trainer response
    setTimeout(() => {
      const trainerResponses = [
        "Great question! Let's work on that together.",
        "I'd suggest focusing on your form first before increasing the weight.",
        "Remember to breathe properly during this exercise.",
        "You're making excellent progress! Keep it up!",
        "Try to complete 3 sets of 12 reps for best results."
      ];
      
      const randomResponse = trainerResponses[Math.floor(Math.random() * trainerResponses.length)];
      
      setMessages(prev => [...prev, {
        sender: 'trainer',
        message: randomResponse,
        time: new Date().toLocaleTimeString()
      }]);
    }, 2000);
  };

  const handleEndSession = () => {
    setActiveConnection(null);
    setPaymentSuccess(false);
    setMeetingUrl("");
    setMessages([]);
    
    toast({
      title: "Session ended",
      description: "Your training session has ended.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/payment')} className="mr-3">
            <X className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Live Training Session</h1>
        </div>

        {!paymentSuccess && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={expert?.profile_image} alt={expert?.full_name} />
                <AvatarFallback>{expert?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{expert?.full_name}</CardTitle>
                <CardDescription>{expert?.specialization}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{expert?.bio}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Select Duration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {rates.map((rate) => (
                    <Button
                      key={rate.duration}
                      variant={selectedRate?.duration === rate.duration ? "default" : "outline"}
                      onClick={() => setSelectedRate(rate)}
                      className="flex flex-col py-4"
                    >
                      <span className="text-lg">{rate.duration} min</span>
                      <span className="text-muted-foreground">₹{rate.price}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Connection Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button onClick={() => handleConnect('video')} className="flex gap-2 h-auto py-6">
                  <Video className="h-5 w-5" />
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">Video Call</span>
                    <span className="text-xs text-muted-foreground">Face-to-face training</span>
                  </div>
                </Button>
                <Button onClick={() => handleConnect('voice')} className="flex gap-2 h-auto py-6">
                  <Phone className="h-5 w-5" />
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">Voice Call</span>
                    <span className="text-xs text-muted-foreground">Audio guidance</span>
                  </div>
                </Button>
                <Button onClick={() => handleConnect('chat')} className="flex gap-2 h-auto py-6">
                  <MessageCircle className="h-5 w-5" />
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">Chat</span>
                    <span className="text-xs text-muted-foreground">Text-based coaching</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentSuccess && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeConnection === 'video' && <Video className="h-5 w-5 text-green-500" />}
                {activeConnection === 'voice' && <Phone className="h-5 w-5 text-green-500" />}
                {activeConnection === 'chat' && <MessageCircle className="h-5 w-5 text-green-500" />}
                Live Session with {expert?.full_name}
              </CardTitle>
              <CardDescription>
                {selectedRate?.duration} minutes session - ₹{selectedRate?.price}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(activeConnection === 'video' || activeConnection === 'voice') && (
                <div className="text-center py-10">
                  <div className="mb-4">
                    <Button 
                      onClick={() => window.open(meetingUrl, '_blank')} 
                      className="pulse-animation"
                    >
                      {activeConnection === 'video' ? (
                        <><Video className="mr-2 h-5 w-5" /> Join Video Call</>
                      ) : (
                        <><Phone className="mr-2 h-5 w-5" /> Join Voice Call</>
                      )}
                    </Button>
                  </div>
                  <p className="text-muted-foreground">
                    Click the button above to open the meeting in a new tab
                  </p>
                </div>
              )}
              
              {activeConnection === 'chat' && (
                <div className="flex flex-col h-96">
                  <div className="flex-grow overflow-y-auto mb-4 p-3 border rounded-lg">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mb-2 opacity-40" />
                        <p>Your chat with {expert?.full_name} will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg, index) => (
                          <div 
                            key={index} 
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`rounded-lg px-3 py-2 max-w-[80%] ${
                                msg.sender === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p>{msg.message}</p>
                              <p className={`text-xs ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {msg.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-grow rounded-md border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button type="submit">Send</Button>
                  </form>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{selectedRate?.duration} minutes session</span>
              </div>
              <Button variant="destructive" onClick={handleEndSession}>
                End Session
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment for Live Session</DialogTitle>
            <DialogDescription>
              Complete payment to start your session with {expert?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{selectedRate?.duration} minutes {activeConnection} session</span>
              <span>₹{selectedRate?.price}</span>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Payment Method</h4>
              <Tabs defaultValue="card">
                <TabsList className="w-full">
                  <TabsTrigger value="card" className="flex-1">Credit Card</TabsTrigger>
                  <TabsTrigger value="upi" className="flex-1">UPI</TabsTrigger>
                  <TabsTrigger value="wallet" className="flex-1">Wallet</TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="space-y-4 mt-4">
                  <div className="grid gap-3">
                    <div>
                      <label className="text-sm font-medium">Card Number</label>
                      <input
                        className="w-full rounded-md border p-2 text-sm"
                        placeholder="4242 4242 4242 4242"
                        defaultValue="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Expiry Date</label>
                        <input
                          className="w-full rounded-md border p-2 text-sm"
                          placeholder="MM/YY"
                          defaultValue="12/25"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">CVV</label>
                        <input
                          className="w-full rounded-md border p-2 text-sm"
                          placeholder="123"
                          defaultValue="123"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="upi" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">UPI ID</label>
                    <input
                      className="w-full rounded-md border p-2 text-sm"
                      placeholder="yourname@upi"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="wallet" className="space-y-4 mt-4">
                  <div className="grid gap-3">
                    <Button variant="outline" className="justify-start">
                      <img src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" alt="Paytm" className="h-5 w-5 mr-2" />
                      Paytm
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <img src="https://cdn-icons-png.flaticon.com/512/6124/6124992.png" alt="PhonePe" className="h-5 w-5 mr-2" />
                      PhonePe
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handlePaymentComplete} className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay ₹{selectedRate?.price}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavbar />
    </div>
  );
};

export default LiveTrainer;
