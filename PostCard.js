import React from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiHeart, FiEye, FiTag, FiDollarSign } from 'react-icons/fi';
import moment from 'moment';

const PostCard = ({ post }) => {
  const {
    _id,
    title,
    content,
    author,
    category,
    createdAt,
    replies,
    likes,
    views,
    price,
    isFree,
    images,
    isSold,
    isPinned
  } = post;

  // Truncate content for preview
  const truncateContent = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Format date
  const formatDate = (date) => {
    return moment(date).fromNow();
  };

  return (
    <div className={`bg-dark-800 rounded-lg overflow-hidden border ${
      isPinned ? 'border-primary-500' : 'border-dark-700'
    } transition-transform duration-200 hover:transform hover:scale-[1.01] hover:shadow-lg`}>
      {/* Post Image */}
      <div className="relative h-48 overflow-hidden bg-dark-700">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700">
            <span className="text-4xl text-gray-600">📄</span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            isFree ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
          }`}>
            {isFree ? (
              <>
                <span className="mr-1">Free</span>
              </>
            ) : (
              <>
                <FiDollarSign className="mr-1" />
                <span>${price}</span>
              </>
            )}
          </span>
        </div>
        
        {/* Sold Badge */}
        {isSold && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-md font-bold transform rotate-[-15deg] text-xl">
              SOLD
            </span>
          </div>
        )}
        
        {/* Pinned Badge */}
        {isPinned && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-900 text-primary-300">
              Pinned
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="mb-2">
          <Link 
            to={`/category/${category.slug}`}
            className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-primary-500"
          >
            <FiTag className="mr-1" />
            {category.name}
          </Link>
        </div>
        
        {/* Title */}
        <Link to={`/post/${_id}`}>
          <h3 className="text-xl font-bold text-white hover:text-primary-500 mb-2 line-clamp-2">
            {title}
          </h3>
        </Link>
        
        {/* Content Preview */}
        <p className="text-gray-400 mb-4 line-clamp-2">
          {truncateContent(content)}
        </p>
        
        {/* Author & Date */}
        <div className="flex items-center mb-4">
          <Link to={`/profile/${author.username}`} className="flex items-center">
            <img 
              src={author.profile.avatar || '/assets/images/default-avatar.png'} 
              alt={author.username}
              className="w-8 h-8 rounded-full object-cover border border-dark-700"
            />
            <span className="ml-2 text-sm font-medium text-gray-300 hover:text-primary-500">
              {author.username}
            </span>
          </Link>
          <span className="mx-2 text-gray-600">•</span>
          <span className="text-sm text-gray-500">
            {formatDate(createdAt)}
          </span>
        </div>
        
        {/* Stats */}
        <div className="flex items-center text-gray-500 text-sm pt-3 border-t border-dark-700">
          <div className="flex items-center mr-4">
            <FiMessageSquare className="mr-1" />
            <span>{replies ? replies.length : 0}</span>
          </div>
          <div className="flex items-center mr-4">
            <FiHeart className="mr-1" />
            <span>{likes ? likes.length : 0}</span>
          </div>
          <div className="flex items-center">
            <FiEye className="mr-1" />
            <span>{views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;