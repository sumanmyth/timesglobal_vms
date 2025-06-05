import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}) => {
  const baseStyles = "px-6 py-3 font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-150 ease-in-out";
  const widthStyles = fullWidth ? "w-full" : "";

  let variantStyles = "";
  if (variant === 'primary') {
    variantStyles = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
  } else if (variant === 'secondary') {
    variantStyles = "bg-gray-600 text-gray-100 hover:bg-gray-500 focus:ring-gray-400";
  }

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles} ${widthStyles} ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
