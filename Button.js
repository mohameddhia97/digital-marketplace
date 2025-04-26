import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  disabled = false,
  to = null,
  href = null,
  onClick = null,
  isLoading = false,
  icon = null
}) => {
  // Style classes based on variant
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-dark-600 hover:bg-dark-700 text-white border border-dark-500',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
    ghost: 'bg-transparent hover:bg-dark-800 text-gray-300'
  };

  // Style classes based on size
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl'
  };

  // Disabled state
  const disabledClasses = disabled
    ? 'opacity-60 cursor-not-allowed'
    : 'transition-colors duration-200';

  // Full width
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabledClasses}
    ${widthClass}
    rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
    flex items-center justify-center
    ${className}
  `;

  // Loading state
  const loadingSpinner = (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0
        12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  // Content with icon
  const content = (
    <>
      {isLoading && loadingSpinner}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );

  // Render based on 'to' or 'href' props
  if (to) {
    return (
      <Link to={to} className={buttonClasses} disabled={disabled || isLoading}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        disabled={disabled || isLoading}
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {content}
    </button>
  );
};

export default Button;