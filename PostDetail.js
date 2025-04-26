import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageSquare, FiEye, FiShare2, FiFlag, FiTag, FiEdit, FiTrash2, FiSend } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';
import { postAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import moment from 'moment';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, hasRole } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await postAPI.getPost(id);
        setPost(res.data.post);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. It may have been deleted or is not available.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to reply');
      return;
    }
    
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    
    setReplyLoading(true);
    try {
      const res = await postAPI.addReply(post._id, replyContent);
      setPost({
        ...post,
        replies: res.data.replies
      });
      setReplyContent('');
      toast.success('Reply added successfully');
    } catch (err) {
      console.error('Error adding reply:', err);
      toast.error('Failed to add reply');
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle like post
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to like posts');
      return;
    }
    
    setLikeLoading(true);
    try {
      const res = await postAPI.likePost(post._id);
      setPost({
        ...post,
        likes: res.data.likes
      });
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to like post');
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle like reply
  const handleLikeReply = async (replyId) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to like replies');
      return;
    }
    
    try {
      const res = await postAPI.likeReply(post._id, replyId);
      
      // Update the post object with updated replies
      const updatedReplies = post.replies.map(reply => 
        reply._id === replyId ? { ...reply, likes: res.data.likes } : reply
      );
      
      setPost({
        ...post,
        replies: updatedReplies
      });
    } catch (err) {
      console.error('Error liking reply:', err);
      toast.error('Failed to like reply');
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!isAuthenticated) return;
    
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await postAPI.deletePost(post._id);
        toast.success('Post deleted successfully');
        navigate('/');
      } catch (err) {
        console.error('Error deleting post:', err);
        toast.error('Failed to delete post');
      }
    }
  };

  // Check if user can edit/delete post
  const canModifyPost = isAuthenticated && (
    post?.author?._id === user?._id || hasRole(['admin', 'moderator', 'owner'])
  );

  // Format date
  const formatDate = (date) => {
    return moment(date).format('MMMM D, YYYY [at] h:mm A');
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  if (error || !post) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
        <Button
          to="/"
          variant="primary"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        {/* Post Header */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex justify-between items-start mb-4">
            {/* Category */}
            <Link 
              to={`/category/${post.category.slug}`}
              className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-primary-500"
            >
              <FiTag className="mr-1" />
              {post.category.name}
            </Link>
            
            {/* Actions */}
            {canModifyPost && (
              <div className="flex space-x-2">
                <Button
                  to={`/edit-post/${post._id}`}
                  variant="ghost"
                  size="sm"
                  icon={<FiEdit />}
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDeletePost}
                  variant="danger"
                  size="sm"
                  icon={<FiTrash2 />}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{post.title}</h1>
          
          {/* Author & Date */}
          <div className="flex items-center mb-2">
            <Link to={`/profile/${post.author.username}`} className="flex items-center">
              <img 
                src={post.author.profile.avatar || '/assets/images/default-avatar.png'} 
                alt={post.author.username}
                className="w-8 h-8 rounded-full object-cover border border-dark-700"
              />
              <span className="ml-2 text-sm font-medium text-gray-300 hover:text-primary-500">
                {post.author.username}
              </span>
            </Link>
            <span className="mx-2 text-gray-600">•</span>
            <span className="text-sm text-gray-500">
              {formatDate(post.createdAt)}
            </span>
            
            {post.updatedAt !== post.createdAt && (
              <span className="ml-2 text-xs text-gray-600">
                (Edited {moment(post.updatedAt).fromNow()})
              </span>
            )}
          </div>
          
          {/* Price/Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              post.isFree ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
            }`}>
              {post.isFree ? 'Free' : `$${post.price}`}
            </span>
            
            {post.tags && post.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-dark-700 text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Post Content */}
        <div className="p-6 border-b border-dark-700">
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4">
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`${post.title} - Image ${index + 1}`}
                  className="rounded-lg max-h-96 w-auto mx-auto"
                />
              ))}
            </div>
          )}
          
          {/* Text Content */}
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>
        </div>
        
        {/* Post Actions */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center space-x-1 ${
                isAuthenticated && post.likes.includes(user._id) 
                  ? 'text-primary-500' 
                  : 'text-gray-400 hover:text-primary-500'
              }`}
            >
              <FiHeart className={`${isAuthenticated && post.likes.includes(user._id) ? 'fill-current' : ''}`} />
              <span>{post.likes.length}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-400">
              <FiMessageSquare />
              <span>{post.replies.length}</span>
            </button>
            
            <div className="flex items-center space-x-1 text-gray-400">
              <FiEye />
              <span>{post.views}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-primary-500">
              <FiShare2 />
            </button>
            
            <button className="text-gray-400 hover:text-red-500">
              <FiFlag />
            </button>
          </div>
        </div>
        
        {/* Reply Form */}
        <div className="p-6 border-b border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">Leave a Reply</h3>
          
          {isAuthenticated ? (
            <form onSubmit={handleReplySubmit}>
              <div className="mb-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 rounded-md bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Write your reply here..."
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={replyLoading}
                  disabled={replyLoading || !replyContent.trim()}
                  icon={<FiSend />}
                >
                  Post Reply
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 mb-3">You need to be logged in to reply</p>
              <Button to="/login" variant="primary">
                Log In
              </Button>
            </div>
          )}
        </div>
        
        {/* Replies */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Replies ({post.replies.length})
          </h3>
          
          {post.replies.length > 0 ? (
            <div className="space-y-6">
              {post.replies.map((reply) => (
                <div key={reply._id} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <Link to={`/profile/${reply.user.username}`} className="flex items-center">
                        <img 
                          src={reply.user.profile?.avatar || '/assets/images/default-avatar.png'} 
                          alt={reply.user.username}
                          className="w-6 h-6 rounded-full object-cover border border-dark-700"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-300 hover:text-primary-500">
                          {reply.user.username}
                        </span>
                      </Link>
                      <span className="mx-2 text-gray-600">•</span>
                      <span className="text-xs text-gray-500">
                        {moment(reply.createdAt).fromNow()}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleLikeReply(reply._id)}
                      className={`flex items-center space-x-1 text-sm ${
                        isAuthenticated && reply.likes.includes(user._id) 
                          ? 'text-primary-500' 
                          : 'text-gray-400 hover:text-primary-500'
                      }`}
                    >
                      <FiHeart className={`${isAuthenticated && reply.likes.includes(user._id) ? 'fill-current' : ''}`} />
                      <span>{reply.likes.length}</span>
                    </button>
                  </div>
                  
                  <p className="text-gray-300 whitespace-pre-line">{reply.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-700 rounded-lg p-6 text-center">
              <p className="text-gray-400">No replies yet. Be the first to reply!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;