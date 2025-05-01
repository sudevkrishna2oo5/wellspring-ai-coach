
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Calendar, Clock, User, Video } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import BottomNavbar from "@/components/BottomNavbar";

const ExpertDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [expertId, setExpertId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        // Get expert profile
        const { data: expertData } = await supabase
          .from('experts')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (expertData) {
          setExpertId(expertData.id);
          // Now the is_online field exists on the experts table
          setIsOnline(expertData.is_online || false);
          
          // Fetch expert sessions
          const { data: sessionsData } = await supabase
            .from('expert_sessions')
            .select(`
              *,
              profiles:user_id (
                full_name,
                avatar_url
              )
            `)
            .eq('expert_id', expertData.id)
            .order('session_date', { ascending: true });
            
          setSessions(sessionsData || []);
        }
      } catch (error) {
        console.error('Error fetching expert data:', error);
        toast({
          title: "Error",
          description: "Could not load expert data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExpertData();
  }, [navigate]);

  const handleOnlineStatusChange = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('experts')
        .update({
          is_online: checked,
          last_active: new Date().toISOString()
        })
        .eq('id', expertId);

      if (error) throw error;

      setIsOnline(checked);
      toast({
        title: checked ? "You're now online" : "You're now offline",
        description: checked ? "Clients can book sessions with you" : "You won't receive new bookings",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Could not update status",
        variant: "destructive"
      });
    }
  };

  const joinSession = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Expert Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Available for sessions</span>
            <Switch checked={isOnline} onCheckedChange={handleOnlineStatusChange} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {sessions.filter(s => 
                  new Date(s.session_date).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Next Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <p className="text-lg">
                  {new Date(sessions[0].session_date).toLocaleTimeString()}
                </p>
              ) : (
                <p className="text-muted-foreground">No upcoming sessions</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(sessions.map(s => s.user_id)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Manage your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.profiles?.full_name || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      {new Date(session.session_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(session.session_date).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      {session.meeting_link ? (
                        <Button
                          variant="outline"
                          onClick={() => joinSession(session.meeting_link)}
                          className="flex items-center gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Join
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          Pending
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No upcoming sessions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default ExpertDashboard;
