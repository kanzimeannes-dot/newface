import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Image, Video, Smile, MoreHorizontal, ThumbsUp, MessageCircle, Share2, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Post {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  profile_pic: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  is_verified: boolean;
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !image) return;

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    const res = await fetch('/api/posts', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      setContent('');
      setImage(null);
      fetchPosts();
    }
  };

  return (
    <div className="max-w-[680px] w-full mx-auto py-6 px-4">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-2 mb-3">
          <img src={user?.profilePic} alt="" className="w-10 h-10 rounded-full object-cover" />
          <button 
            onClick={() => document.getElementById('post-input')?.focus()}
            className="bg-gray-100 hover:bg-gray-200 transition flex-1 rounded-full text-left px-4 text-gray-500"
          >
            What's on your mind, {user?.fullName.split(' ')[0]}?
          </button>
        </div>
        <hr className="mb-3" />
        <form onSubmit={handleCreatePost}>
          <textarea 
            id="post-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-50 rounded-lg p-3 text-sm outline-none mb-2 resize-none"
            placeholder="Write something..."
            rows={2}
          />
          {image && (
            <div className="relative mb-2">
              <img src={URL.createObjectURL(image)} alt="Preview" className="w-full rounded-lg max-h-96 object-cover" />
              <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">✕</button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
                <Video className="text-red-500 w-6 h-6" />
                <span className="text-sm font-semibold text-gray-500">Live Video</span>
              </label>
              <label className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
                <Image className="text-green-500 w-6 h-6" />
                <span className="text-sm font-semibold text-gray-500">Photo/video</span>
                <input type="file" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </label>
              <label className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
                <Smile className="text-yellow-500 w-6 h-6" />
                <span className="text-sm font-semibold text-gray-500">Feeling/activity</span>
              </label>
            </div>
            <button 
              type="submit"
              disabled={!content && !image}
              className="bg-blue-600 text-white px-6 py-1.5 rounded-md font-semibold disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading posts...</div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onUpdate }: { post: Post, onUpdate: () => void }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const handleLike = async () => {
    await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
    onUpdate();
  };

  const fetchComments = async () => {
    const res = await fetch(`/api/posts/${post.id}/comments`);
    if (res.ok) setComments(await res.json());
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText) return;
    await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText })
    });
    setCommentText('');
    fetchComments();
    onUpdate();
  };

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${post.user_id}`}>
              <img src={post.profile_pic} alt="" className="w-10 h-10 rounded-full object-cover" />
            </Link>
            <div>
              <div className="flex items-center gap-1">
                <Link to={`/profile/${post.user_id}`} className="font-semibold text-sm hover:underline">{post.full_name}</Link>
                {post.is_verified && <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500" />}
              </div>
              <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.created_at))} ago</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
      </div>
      
      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover" />
      )}

      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between text-gray-500 text-sm">
        <div className="flex items-center gap-1">
          <div className="bg-blue-500 rounded-full p-1"><ThumbsUp className="w-3 h-3 text-white fill-white" /></div>
          <span>{post.likesCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{post.commentsCount} comments</span>
          <span>0 shares</span>
        </div>
      </div>

      <div className="px-4 py-1 flex items-center justify-between">
        <button 
          onClick={handleLike}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition font-semibold text-sm",
            post.isLiked ? "text-blue-600" : "text-gray-500"
          )}
        >
          <ThumbsUp className={cn("w-5 h-5", post.isLiked && "fill-blue-600")} />
          Like
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition font-semibold text-sm text-gray-500"
        >
          <MessageCircle className="w-5 h-5" />
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition font-semibold text-sm text-gray-500">
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {showComments && (
        <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <div className="space-y-3 mb-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <img src={comment.profile_pic} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div className="bg-gray-200 rounded-2xl px-3 py-2 max-w-[90%]">
                  <p className="font-bold text-xs">{comment.username}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <img src={post.profile_pic} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1 bg-gray-200 rounded-full flex items-center px-3">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..." 
                className="bg-transparent border-none outline-none text-sm flex-1 py-1.5"
              />
              <button type="submit" className="text-blue-600 font-semibold text-sm ml-2">Post</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
