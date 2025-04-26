import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-3xl font-bold text-white mt-4 mb-6">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button to="/" variant="primary" size="lg" icon={<FiHome />}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;