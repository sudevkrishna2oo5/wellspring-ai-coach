
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import BottomNavbar from '@/components/BottomNavbar';
import { format } from 'date-fns';
import { 
  ChevronLeft, Heart, MessageSquare, Share2, 
  Image as ImageIcon, Smile, Send, X, PlusCircle
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tables } from '@/integrations/supabase/types';

type Post = Tables<'posts'> & { user_profile?: { username: string; avatar_url: string; full_name: string } };
type Comment = Tables<'comments'> & { user_profile?: { username: string; avatar_url: string; full_name: string } };

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', type: 'text' });
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profile:user_id(username, avatar_url, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    setShowComments(true);
    setCurrentPostId(postId);
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profile:user_id(username, avatar_url, full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Post content required",
        description: "Please write something for your post",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: session.session.user.id,
          content: newPost.content,
          type: newPost.type,
        }])
        .select(`
          *,
          user_profile:user_id(username, avatar_url, full_name)
        `);

      if (error) throw error;

      setPosts([data[0], ...posts]);
      setShowCreatePost(false);
      setNewPost({ content: '', type: 'text' });
      
      toast({
        title: "Post created!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !currentPostId) {
      toast({
        title: "Comment required",
        description: "Please write something for your comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          user_id: session.session.user.id,
          post_id: currentPostId,
          content: newComment,
        }])
        .select(`
          *,
          user_profile:user_id(username, avatar_url, full_name)
        `);

      if (error) throw error;

      setComments([...comments, data[0]]);
      setNewComment('');
      
      toast({
        title: "Comment added!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Find the post and update its likes locally first for instant feedback
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return { ...post, likes: (post.likes || 0) + 1 };
        }
        return post;
      });
      setPosts(updatedPosts);

      // Then update in the database
      const { error } = await supabase
        .from('posts')
        .update({ likes: updatedPosts.find(p => p.id === postId)?.likes })
        .eq('id', postId);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error liking post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/5 via-background to-indigo-500/5 pb-16">
      <header className="py-4 px-6 flex items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white">
        <Button 
          variant="ghost" 
          className="mr-2 text-white hover:bg-white/10" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Community</h1>
      </header>

      <main className="p-4 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-dark to-indigo-DEFAULT bg-clip-text text-transparent">
            Your Fitness Community
          </h2>
          <Button 
            onClick={() => setShowCreatePost(true)}
            className="bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Post
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center my-10">
            <div className="animate-pulse h-6 w-6 rounded-full bg-violet-DEFAULT"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Avatar className="h-10 w-10 mr-3">
                      {post.user_profile?.avatar_url ? (
                        <AvatarImage src={post.user_profile.avatar_url} />
                      ) : (
                        <AvatarFallback>{getInitials(post.user_profile?.full_name || '')}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.user_profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.created_at && format(new Date(post.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <p className="py-2">{post.content}</p>
                  
                  {post.media_url && (
                    <div className="rounded-md overflow-hidden my-2 bg-muted">
                      <img 
                        src={post.media_url} 
                        alt="Post media" 
                        className="w-full h-auto object-cover" 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      onClick={() => handleLikePost(post.id)}
                    >
                      <Heart className="h-4 w-4 mr-1" fill={post.likes && post.likes > 0 ? "currentColor" : "none"} />
                      <span>{post.likes || 0}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => fetchComments(post.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>Comment</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      <span>Share</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share with the community!</p>
            <Button 
              className="mt-4 bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT"
              onClick={() => setShowCreatePost(true)}
            >
              Create a Post
            </Button>
          </div>
        )}

        {/* Create Post Dialog */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="What's on your fitness mind?"
                className="min-h-32 mb-4"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT"
                  onClick={handleCreatePost}
                >
                  Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Comments Dialog */}
        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                Comments
                <Button variant="ghost" size="icon" onClick={() => setShowComments(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {loadingComments ? (
                <div className="flex justify-center my-10">
                  <div className="animate-pulse h-5 w-5 rounded-full bg-violet-DEFAULT"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        {comment.user_profile?.avatar_url ? (
                          <AvatarImage src={comment.user_profile.avatar_url} />
                        ) : (
                          <AvatarFallback>{getInitials(comment.user_profile?.full_name || '')}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg flex-1">
                        <p className="font-medium text-sm">{comment.user_profile?.full_name || 'User'}</p>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {comment.created_at && format(new Date(comment.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-4">
                  <p className="text-muted-foreground">No comments yet. Be the first!</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button 
                  className="bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT"
                  size="icon"
                  onClick={handleCreateComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <BottomNavbar currentPage="community" />
    </div>
  );
};

export default Community;
