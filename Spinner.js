import React from 'react';

const Spinner = ({ size = 'medium' }) => {
  const sizeClass = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }[size] || 'w-10 h-10';

  return (
    <div className="flex justify-center items-center py-6">
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-gray-600 border-t-primary-500`}></div>
    </div>
  );
};

export default Spinner;