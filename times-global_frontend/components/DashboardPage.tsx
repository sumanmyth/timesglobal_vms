
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import DashboardCard from './common/DashboardCard';
import Button from './common/Button'; 

interface DashboardPageProps {
  onLogout: () => void;
}

const VisitorIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v1m-4 0h4M9 14h6M9 17h2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DeviceStorageIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12H3v7a2 2 0 002 2h14a2 2 0 002-2v-7h-2M5 12V5a2 2 0 012-2h10a2 2 0 012 2v7M5 12h14" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h.01M7 8h.01M7 16h.01M17 16h.01" />
  </svg>
);

const GatePassIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5L9 5M15 5C16.6569 5 18 6.34315 18 8L18 16C18 17.6569 16.6569 19 15 19L9 19C7.34315 19 6 17.6569 6 16L6 8C6 6.34315 7.34315 5 9 5M15 5C14.4477 5 14 5.44772 14 6L14 18C14 18.5523 14.4477 19 15 19" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6m-6 3h6m-6 3h3" />
  </svg>
);

const InventoryIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const TaskManagementIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 5.25h16.5M3.75 6.75h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75L6 8.25l3-3M4.5 12L6 13.5l3-3M4.5 17.25L6 18.75l3-3" />
  </svg>
);

interface DashboardItem {
  title: string;
  icon: JSX.Element;
  id: string;
}

const dashboardItems: DashboardItem[] = [
  { title: 'Visitor Management System', icon: <VisitorIcon />, id: 'vms' },
  { title: 'Device Storage', icon: <DeviceStorageIcon />, id: 'device-storage' },
  { title: 'Gate Pass Management', icon: <GatePassIcon />, id: 'gate-pass' },
  { title: 'Inventory Management', icon: <InventoryIcon />, id: 'inventory' },
  { title: 'Task Management', icon: <TaskManagementIcon />, id: 'task-management' },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const navigate = useNavigate(); 
  const [usernameDisplay, setUsernameDisplay] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsernameDisplay(storedUsername);
    }
  }, []);

  const handleCardClick = (id: string, title: string) => {
    if (id === 'vms') {
      navigate('/vms/home');
    } else if (id === 'device-storage') {
      navigate('/dashboard/device-storage');
    } else if (id === 'gate-pass') {
      navigate('/dashboard/gate-pass');
    }
     else {
      alert(`Navigating to ${title} (ID: ${id}) - Feature not implemented yet.`);
    }
  };

  return (
    <div 
      className="relative text-gray-100" // Main background container
      style={{ 
        backgroundImage: "url('/images/bgdatacenter.jpeg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed' 
      }}
    >
      {/* Page-level blur overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md z-0"></div>

      {/* Content wrapper on top of the blur */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="bg-slate-800 bg-opacity-70 backdrop-blur-sm shadow-lg p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-red-600">Times Global</h1>
              <p className="text-gray-300 text-sm">Management Software</p> 
            </div>
            <div className="flex items-center space-x-4">
              {usernameDisplay && (
                <span className="text-gray-200 text-sm"> 
                  Welcome, {usernameDisplay}
                </span>
              )}
              <Button onClick={onLogout} variant="secondary" className="bg-opacity-80"> 
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-6 md:p-8">
          <h2 className="text-3xl font-semibold text-gray-100 mb-8 text-center md:text-left">Dashboard Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item: DashboardItem) => (
              <DashboardCard
                key={item.id}
                title={item.title}
                icon={item.icon}
                onClick={() => handleCardClick(item.id, item.title)}
              />
            ))}
          </div>
          {/* Times Global Logo added here */}
          <div className="mt-16 mb-8 flex justify-center"> 
            <img 
              src="/images/Times Global.png" 
              alt="Times Global Logo" 
              className="h-40 w-auto" // Adjusted height for visibility
            />
          </div>
        </main>

        <footer className="bg-slate-800 bg-opacity-70 backdrop-blur-sm py-8 px-4 text-gray-300 mt-auto"> 
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61569411427618" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Times Global on Facebook"
                className="text-gray-300 hover:text-red-500 transition-colors" 
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/timesglobal/posts/?feedView=all" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Times Global on LinkedIn"
                className="text-gray-300 hover:text-red-500 transition-colors" 
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="text-center md:text-left text-sm">
              <p>
                <a href="http://timesglobal.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                  timesglobal.com.np
                </a>
              </p>
              <p>Phone: +977-9851020982</p>
              <p>Address: Dhumbarai, Kathmandu, Nepal</p>
            </div>
            <div className="text-center md:text-right text-sm">
              <p>© {new Date().getFullYear()} Times Global Data Centre. <br className="sm:hidden"/>All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardPage;
