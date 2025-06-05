
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../common/Button';

interface TaskManagementDashboardLayoutProps {
  onLogout: () => void;
}

interface SidebarNavItem {
  name: string;
  path: string;
}

const TaskManagementDashboardLayout: React.FC<TaskManagementDashboardLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const sidebarNavItems: SidebarNavItem[] = [
    { name: 'Home', path: '/task-management/home' },
    { name: 'Add Task', path: '/task-management/add-task' },
    { name: 'Task List', path: '/task-management/task-list' },
    { name: 'Reports', path: '/task-management/reports' },
  ];

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login', {replace: true});
  }

  const handleBackToDashboardClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div 
      className="relative"
      style={{ 
        backgroundImage: "url('/images/bgdatacenter.jpeg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed' 
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-lg z-0"></div>
      <div className="relative z-10 flex h-screen text-gray-100">
        <aside 
          className={`w-60 bg-slate-800 bg-opacity-70 backdrop-blur-md shadow-lg flex flex-col fixed top-0 left-0 h-full z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
          id="task-management-sidebar"
        >
          <div className="p-5 border-b border-gray-700">
            {/* Replaced logo with text */}
            <h1 className="text-2xl font-bold text-red-600 text-center">TIMES GLOBAL</h1>
          </div>
          <nav className="flex-grow p-4 space-y-1">
            {sidebarNavItems.map((item: SidebarNavItem) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} 
                className={({ isActive }: { isActive: boolean }) =>
                  `block py-2.5 px-4 rounded-md transition duration-200 text-sm 
                  hover:bg-red-600 hover:text-white 
                  focus:outline-none focus:bg-red-600 focus:text-white
                  ${isActive ? 'bg-red-600 text-white shadow-md' : 'text-gray-300'}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          {/* Logo Section Added at the bottom of the sidebar */}
          <div className="p-4 flex justify-center items-center">
            <img
              src="/images/Times Global.png"
              alt="Times Global Logo"
              className="h-22 w-auto" 
            />
          </div>

          <div className="p-4 mt-auto border-t border-gray-700 space-y-2">
            <Button 
              onClick={handleBackToDashboardClick} 
              fullWidth 
              variant="secondary" 
              className="bg-gray-600 hover:bg-gray-500"
            >
              Back to Main Dashboard
            </Button>
            <Button 
              onClick={handleLogoutClick} 
              fullWidth 
              className="bg-red-700 hover:bg-red-800"
            >
              Log Out
            </Button>
          </div>
        </aside>

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        <div className="flex-1 flex flex-col md:ml-60">
          <header className="bg-red-700 bg-opacity-80 backdrop-blur-md shadow-md text-white p-4 sticky top-0 z-20">
            <div className="container mx-auto flex items-center justify-between">
              <button 
                className="md:hidden text-white p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-expanded={isSidebarOpen}
                aria-controls="task-management-sidebar"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {isSidebarOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <h2 className="text-xl font-semibold text-center flex-grow">Task Management System</h2>
              <div className="w-6 md:hidden"></div> 
            </div>
          </header>

          <main className="flex-grow p-2 sm:p-4 md:p-6 overflow-y-auto">
            <Outlet />
          </main>
          
          <footer className="bg-slate-800 bg-opacity-70 backdrop-blur-md p-3 text-center text-gray-300 text-xs mt-auto">
            © {new Date().getFullYear()} Times Global Task Management. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementDashboardLayout;
