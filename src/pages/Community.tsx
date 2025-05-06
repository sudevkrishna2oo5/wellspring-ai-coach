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
  Image as ImageIcon, Smile, Send, X, PlusCircle, Trash2
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tables } from '@/integrations/supabase/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Define clearer types for our posts and comments with explicit profile structure
interface UserProfile {
  username: string;
  avatar_url: string;
  full_name: string;
}

type Post = Tables<'posts'> & { user_profile?: UserProfile | null };
type Comment = Tables<'comments'> & { user_profile?: UserProfile | null };

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
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPosts();
    
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        setCurrentUser(session.session.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      // First fetch all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      // Process each post to get its author's profile information
      const postsWithProfiles: Post[] = [];
      
      for (const post of postsData || []) {
        // For each post, get the user profile separately
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name')
          .eq('id', post.user_id)
          .single();
          
        postsWithProfiles.push({
          ...post,
          user_profile: profileData || {
            username: 'unknown',
            avatar_url: null,
            full_name: 'Unknown User'
          }
        });
      }
      
      setPosts(postsWithProfiles);
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
      // First fetch all comments for the post
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      // Process each comment to get its author's profile information
      const commentsWithProfiles: Comment[] = [];
      
      for (const comment of commentsData || []) {
        // For each comment, get the user profile separately
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name')
          .eq('id', comment.user_id)
          .single();
          
        commentsWithProfiles.push({
          ...comment,
          user_profile: profileData || {
            username: 'unknown',
            avatar_url: null,
            full_name: 'Unknown User'
          }
        });
      }
      
      setComments(commentsWithProfiles);
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
        .select();

      if (error) throw error;

      // Get user profile for the new post
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name')
        .eq('id', session.session.user.id)
        .single();
      
      const newPostWithProfile: Post = {
        ...data[0],
        user_profile: profileData || {
          username: 'unknown',
          avatar_url: null,
          full_name: 'Unknown User'
        }
      };

      setPosts([newPostWithProfile, ...posts]);
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
        .select();

      if (error) throw error;
      
      // Get user profile for the new comment
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name')
        .eq('id', session.session.user.id)
        .single();
      
      const newCommentWithProfile: Comment = {
        ...data[0],
        user_profile: profileData || {
          username: 'unknown',
          avatar_url: null,
          full_name: 'Unknown User'
        }
      };

      setComments([...comments, newCommentWithProfile]);
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

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postToDelete);

      if (error) throw error;
      
      // Remove the post from state
      setPosts(posts.filter(post => post.id !== postToDelete));
      
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  const confirmDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
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
                    
                    {/* Delete button - only shown for user's own posts */}
                    {currentUser === post.user_id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => confirmDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post and all associated comments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
