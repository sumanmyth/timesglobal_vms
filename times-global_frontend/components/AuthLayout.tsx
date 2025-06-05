
import React from 'react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative" // Added relative for overlay positioning
      style={{ 
        backgroundImage: "url('/images/bglogin.jpg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat' 
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>

      {/* Content centered on top of the overlay */}
      <div className="w-full max-w-md relative z-10"> {/* Added relative and z-10 */}
        {/* Logo Image */}
        <img 
            src="/images/Times Global.png" 
            alt="Times Global Logo" 
            className="mx-auto h-20 mb-4" // Centered, height 16 (4rem/64px), bottom margin 4
        />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600">Times Global</h1>
          <p className="text-gray-400 text-lg">Data Centre Management</p>
        </div>
        <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-2xl"> {/* Added bg-opacity-90 to form box for subtle see-through */}
          <h2 className="text-2xl font-semibold text-center text-gray-100 mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
