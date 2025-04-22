import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import BottomNavbar from "@/components/BottomNavbar";
import { Check, User, Calendar, Clock, DollarSign, CreditCard, MessageCircle, Video, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications, showNotificationToast } from "@/hooks/use-notifications";
import { useNavigate } from "react-router-dom";

const PaymentDemo = () => {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data, error } = await supabase
          .from('experts')
          .select('*');
        
        if (error) {
          console.error("Error fetching experts:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setExperts(data);
        } else {
          setExperts([
            {
              id: '1',
              full_name: 'Dr. Sarah Johnson',
              specialization: 'Nutrition Expert',
              experience: 8,
              bio: 'Certified nutritionist with expertise in weight management and sports nutrition.',
              hourly_rate: 1500,
              profile_image: 'https://randomuser.me/api/portraits/women/44.jpg',
              availability: JSON.stringify([
                { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['10:00 AM', '2:00 PM'] },
                { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], slots: ['11:00 AM', '3:00 PM'] }
              ])
            },
            {
              id: '2',
              full_name: 'Rajesh Mehta',
              specialization: 'Fitness Trainer',
              experience: 10,
              bio: 'Elite trainer specializing in strength training and rehabilitation exercises.',
              hourly_rate: 1200,
              profile_image: 'https://randomuser.me/api/portraits/men/32.jpg',
              availability: JSON.stringify([
                { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['9:00 AM', '5:00 PM'] },
                { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], slots: ['10:00 AM', '4:00 PM'] }
              ])
            },
            {
              id: '3',
              full_name: 'Priya Sharma',
              specialization: 'Yoga Instructor',
              experience: 7,
              bio: 'Experienced yoga instructor with focus on mindfulness and stress management.',
              hourly_rate: 1000,
              profile_image: 'https://randomuser.me/api/portraits/women/68.jpg',
              availability: JSON.stringify([
                { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['7:00 AM', '6:00 PM'] },
                { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], slots: ['8:00 AM', '5:00 PM'] }
              ])
            }
          ]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchExperts();
  }, []);

  const handleExpertSelect = (expert) => {
    setSelectedExpert(expert);
    setShowSlotDialog(true);
  };

  const handleSlotSelect = (date, time) => {
    setSelectedSlot({ date, time });
    setShowSlotDialog(false);
  };

  const handlePayment = () => {
    const options = {
      key: "rzp_test_YOUR_KEY_HERE",
      amount: selectedExpert.hourly_rate * 100,
      currency: "INR",
      name: "FitVibe Consultation",
      description: `Session with ${selectedExpert.full_name}`,
      handler: async (response) => {
        try {
          const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
              user_id: supabase.auth.user()?.id,
              amount: selectedExpert.hourly_rate,
              status: 'completed',
              payment_method: 'razorpay',
              payment_details: response,
              currency: 'INR'
            })
            .select()
            .single();

          if (paymentError) throw paymentError;

          const { data: session, error: sessionError } = await supabase
            .from('expert_sessions')
            .insert({
              expert_id: selectedExpert.id,
              user_id: supabase.auth.user()?.id,
              session_date: new Date(selectedSlot.date + ' ' + selectedSlot.time),
              duration: 30,
              payment_id: payment.id
            })
            .select()
            .single();

          if (sessionError) throw sessionError;

          toast({
            title: "Payment successful!",
            description: `Your session with ${selectedExpert.full_name} has been booked.`,
          });

          await sendNotification('session_booked', {
            expertName: selectedExpert.full_name,
            sessionDate: selectedSlot.date,
            sessionTime: selectedSlot.time
          });

          setTimeout(() => {
            const meetLink = `https://meet.google.com/new`;
            notifyExpertAvailable(meetLink);
          }, 5000);
        } catch (error) {
          console.error('Error saving session:', error);
          toast({
            title: "Error",
            description: "There was a problem saving your session. Please contact support.",
            variant: "destructive"
          });
        }
      },
      prefill: {
        name: "Demo User",
        email: "demo@example.com",
      },
      theme: {
        color: "#7C3AED",
      },
    };

    // @ts-ignore
    const razorpayWindow = new window.Razorpay(options);
    razorpayWindow.open();
  };

  const notifyExpertAvailable = (meetLink) => {
    showNotificationToast(
      "Expert is ready!",
      "Your expert is available now. Click to join the session."
    );

    sendNotification('expert_ready', {
      expertName: selectedExpert?.full_name,
      meetLink
    });

    window.open(meetLink, '_blank');
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatMessage("");
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: { message: userMessage }
      });
      
      if (error) throw error;
      
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Expert Consultation</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <Card key={expert.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={expert.profile_image || "https://via.placeholder.com/300x150?text=Expert"} 
                  alt={expert.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-violet-500" />
                  {expert.full_name}
                </CardTitle>
                <CardDescription>{expert.specialization}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Experience:</span>
                    <span>{expert.experience} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Session Fee:</span>
                    <span>₹{expert.hourly_rate}</span>
                  </div>
                  <p className="mt-3 text-muted-foreground line-clamp-2">{expert.bio}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleExpertSelect(expert)}
                >
                  Book Consultation
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a Time Slot</DialogTitle>
              <DialogDescription>
                Choose an available time slot for your session with {selectedExpert?.full_name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedExpert && (
              <div className="space-y-4">
                {JSON.parse(selectedExpert.availability || '[]').map((day, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {day.slots.map((slot, slotIndex) => (
                        <Button
                          key={slotIndex}
                          variant="outline"
                          onClick={() => handleSlotSelect(day.date, slot)}
                          className="justify-start"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSlotDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {selectedExpert && selectedSlot && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>Review your consultation details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Detail</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Expert</TableCell>
                    <TableCell>{selectedExpert.full_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>
                      {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>{selectedSlot.time}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Duration</TableCell>
                    <TableCell>30 minutes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Amount</TableCell>
                    <TableCell className="font-bold">₹{selectedExpert.hourly_rate}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Button 
                  className="w-full"
                  onClick={handlePayment}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="fixed bottom-20 right-4 z-50">
        {showChatbot ? (
          <div className="bg-white rounded-lg shadow-lg w-80 overflow-hidden border border-gray-200 flex flex-col">
            <div className="p-3 bg-violet-500 text-white flex justify-between items-center">
              <h3 className="text-sm font-medium">FitVibe Assistant</h3>
              <Button variant="ghost" size="sm" className="text-white h-6 w-6 p-0" onClick={toggleChatbot}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-3 h-64 overflow-y-auto flex flex-col space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 my-8">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>How can I help you today?</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`rounded-lg p-2 max-w-[80%] ${
                      msg.sender === 'user' 
                        ? 'bg-violet-100 ml-auto' 
                        : 'bg-gray-100 mr-auto'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="bg-gray-100 rounded-lg p-2 max-w-[80%] mr-auto">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="p-2 border-t border-gray-200 flex">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-violet-500"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <Button type="submit" className="rounded-l-none">
                Send
              </Button>
            </form>
          </div>
        ) : (
          <Button onClick={toggleChatbot} className="rounded-full h-12 w-12 p-0 flex items-center justify-center shadow-lg">
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default PaymentDemo;
