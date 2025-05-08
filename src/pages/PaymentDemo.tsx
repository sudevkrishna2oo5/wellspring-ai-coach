
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PaymentDemo = () => {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();

  useEffect(() => {
    const fetchUserAndExperts = async () => {
      try {
        setIsLoading(true);
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        if (userData && userData.user) {
          setUserId(userData.user.id);
        }
        
        // Fetch experts with availability count
        const { data, error } = await supabase
          .from('experts')
          .select('*, expert_slots:expert_slots(count)')
          .eq('expert_slots.is_booked', false)
          .order('rate', { ascending: true });
        
        if (error) {
          console.error("Error fetching experts:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setExperts(data);
        } else {
          // Fallback to static data if no experts in DB
          setExperts([
            {
              id: '1',
              full_name: 'Dr. Sarah Johnson',
              specialization: 'Nutrition Expert',
              experience: 8,
              bio: 'Certified nutritionist with expertise in weight management and sports nutrition.',
              hourly_rate: 1500,
              rate: 1500,
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
              rate: 1200,
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
              rate: 1000,
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndExperts();
  }, []);

  const handleExpertSelect = async (expert) => {
    setSelectedExpert(expert);
    setIsLoading(true);
    
    try {
      // Fetch available slots for this expert from the database
      const { data, error } = await supabase
        .from('expert_slots')
        .select('id, slot_time')
        .eq('expert_id', expert.id)
        .eq('is_booked', false)
        .order('slot_time');
      
      if (error) {
        console.error("Error fetching slots:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        setAvailableSlots(data);
      } else {
        // Fallback to static data if no slots in DB
        const mockSlots = [];
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Create some mock slots for today
        for (let hour = 9; hour < 17; hour++) {
          const slotTime = new Date(today);
          slotTime.setHours(hour, 0, 0, 0);
          mockSlots.push({
            id: `mock-${expert.id}-${hour}`,
            slot_time: slotTime.toISOString(),
          });
        }
        
        // Create some mock slots for tomorrow
        for (let hour = 9; hour < 17; hour++) {
          const slotTime = new Date(tomorrow);
          slotTime.setHours(hour, 0, 0, 0);
          mockSlots.push({
            id: `mock-${expert.id}-${hour+24}`,
            slot_time: slotTime.toISOString(),
          });
        }
        
        setAvailableSlots(mockSlots);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not load available slots. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowSlotDialog(true);
    }
  };

  const handleSlotSelect = (slotId, slotTime) => {
    setSelectedSlot({ id: slotId, time: slotTime });
    setShowSlotDialog(false);
  };

  const handlePayment = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session",
        variant: "destructive"
      });
      return;
    }
    
    setBookingLoading(true);
    
    try {
      // Use our database function with concurrency control to book the slot
      const { data: bookingResult, error: bookingError } = await supabase
        .rpc('book_expert_slot', {
          p_expert_id: selectedExpert.id,
          p_slot_id: selectedSlot.id,
          p_user_id: userId
        });
      
      if (bookingError) {
        if (bookingError.message.includes("already booked")) {
          toast({
            title: "Slot no longer available",
            description: "This time slot has just been booked by someone else. Please select another time slot.",
            variant: "destructive"
          });
          // Reset selection and show slot dialog again
          setSelectedSlot(null);
          handleExpertSelect(selectedExpert);
        } else {
          console.error('Error processing payment:', bookingError);
          toast({
            title: "Payment failed",
            description: "There was an error processing your payment. Please try again.",
            variant: "destructive"
          });
        }
        return;
      }

      // Get session details
      const paymentId = bookingResult?.[0]?.payment_id;
      const sessionAmount = bookingResult?.[0]?.amount;
      
      // Create a session record
      const { data: session, error: sessionError } = await supabase
        .from('expert_sessions')
        .insert({
          expert_id: selectedExpert.id,
          user_id: userId,
          session_date: new Date(selectedSlot.time).toISOString(),
          duration: 30,
          payment_id: paymentId,
          status: 'confirmed'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error saving session:', sessionError);
        toast({
          title: "Warning",
          description: "Payment was processed but session details couldn't be saved. Our team will contact you.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Payment successful!",
          description: `Your session with ${selectedExpert.full_name} has been booked.`,
        });

        await sendNotification('session_booked', {
          expertName: selectedExpert.full_name,
          sessionDate: new Date(selectedSlot.time).toLocaleDateString(),
          sessionTime: new Date(selectedSlot.time).toLocaleTimeString()
        });

        setTimeout(() => {
          const meetLink = `https://meet.google.com/new`;
          notifyExpertAvailable(meetLink);
        }, 5000);
      }
    } catch (error) {
      console.error('Error in payment process:', error);
      toast({
        title: "Error",
        description: "There was a problem with your payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setBookingLoading(false);
    }
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

    // Update the session with the meeting link
    if (selectedExpert && selectedSlot) {
      supabase
        .from('expert_sessions')
        .update({ meeting_link: meetLink })
        .eq('expert_id', selectedExpert.id)
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .then(({ error }) => {
          if (error) console.error('Error updating meeting link:', error);
        });
    }

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

  // Helper function to format slot times nicely
  const formatSlotTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Group slots by date for better UI organization
  const groupedSlots = availableSlots.reduce((groups, slot) => {
    const { date } = formatSlotTime(slot.slot_time);
    if (!groups[date]) groups[date] = [];
    groups[date].push(slot);
    return groups;
  }, {});

  if (isLoading && !selectedExpert) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
                    <span>₹{expert.rate || expert.hourly_rate}</span>
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
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select a Time Slot</DialogTitle>
              <DialogDescription>
                Choose an available time slot for your session with {selectedExpert?.full_name}
              </DialogDescription>
            </DialogHeader>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedSlots).map(([date, slots], index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">{date}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {slots.map((slot) => {
                        const { time } = formatSlotTime(slot.slot_time);
                        return (
                          <Button
                            key={slot.id}
                            variant="outline"
                            onClick={() => handleSlotSelect(slot.id, slot.slot_time)}
                            className="justify-start"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedSlots).length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                    <p className="text-muted-foreground">No available slots found</p>
                  </div>
                )}
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
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border">
                  {selectedExpert.profile_image ? (
                    <AvatarImage src={selectedExpert.profile_image} alt={selectedExpert.full_name} />
                  ) : (
                    <AvatarFallback>{selectedExpert.full_name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedExpert.full_name}</h3>
                  <p className="text-muted-foreground">{selectedExpert.specialization}</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Detail</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>
                      {formatSlotTime(selectedSlot.time).date}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>{formatSlotTime(selectedSlot.time).time}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Duration</TableCell>
                    <TableCell>30 minutes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Amount</TableCell>
                    <TableCell className="font-bold">₹{selectedExpert.rate || selectedExpert.hourly_rate}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Button 
                  className="w-full"
                  onClick={handlePayment}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </>
                  )}
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
