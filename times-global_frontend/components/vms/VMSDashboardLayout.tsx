
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface VMSDashboardLayoutProps {
  onLogout: () => void;
}

interface VisitorStat {
  id: string;
  checkInTime: string;
  checkOutTime?: string | null;
}

interface StatsData {
  totalToday: number | string;
  unexited: number | string;
  exited: number | string;
}

interface SidebarNavItem {
  name: string;
  path: string;
}

interface StatDisplayItem {
    title: string;
    value: string | number;
}

interface ApiResponse<T> {
  results?: T[];
  [key: string]: any; 
}

const VMSDashboardLayout: React.FC<VMSDashboardLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [statsData, setStatsData] = useState<StatsData>({
    totalToday: 'N/A',
    unexited: 'N/A',
    exited: 'N/A',
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const sidebarNavItems: SidebarNavItem[] = [
    { name: 'Home', path: '/vms/home' },
    { name: 'Add Record', path: '/vms/add-record' },
    { name: 'Visitor List', path: '/vms/visitor-list' },
    { name: 'Reports', path: '/vms/reports' },
    { name: 'Register User', path: '/vms/add-image' },
    { name: 'Add Document', path: '/vms/add-document' },
  ];

  const showStatsBar = location.pathname === '/vms/home' || location.pathname === '/vms';

  const fetchDashboardStats = useCallback(async () => {
    if (!showStatsBar) return;

    setIsLoadingStats(true);
    setStatsError(null);
    try {
      // Corrected date parameter generation for full day coverage
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const queryParams = new URLSearchParams({
        check_in_time_after: todayStart.toISOString(),
        check_in_time_before: todayEnd.toISOString(),
      });

      const data = await apiService.get<VisitorStat[] | ApiResponse<VisitorStat>>(`/visitors/?${queryParams.toString()}`);
      const todaysVisitors: VisitorStat[] = Array.isArray(data) ? data : (data.results || []);

      let unexitedCount = 0;
      let exitedCount = 0;

      todaysVisitors.forEach((visitor: VisitorStat) => {
        if (visitor.checkOutTime) {
          exitedCount++;
        } else {
          unexitedCount++;
        }
      });

      setStatsData({
        totalToday: todaysVisitors.length,
        unexited: unexitedCount,
        exited: exitedCount,
      });

    } catch (err: any) {
      console.error('Fetch Dashboard Stats Error:', err);
      setStatsError(err.message || 'Failed to load dashboard stats.');
      setStatsData({ totalToday: 'Error', unexited: 'Error', exited: 'Error' });
    } finally {
      setIsLoadingStats(false);
    }
  }, [showStatsBar]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats, location.pathname]);


  const handleLogoutClick = () => {
    onLogout();
    navigate('/login', {replace: true});
  }

  const handleBackToDashboardClick = () => {
    navigate('/dashboard');
  };

  const statsToDisplay: StatDisplayItem[] = [
    { title: 'TOTAL VISITORS TODAY', value: isLoadingStats ? '...' : statsError ? 'X' : statsData.totalToday },
    { title: 'UNEXITED VISITORS', value: isLoadingStats ? '...' : statsError ? 'X' : statsData.unexited },
    { title: 'EXITED VISITORS', value: isLoadingStats ? '...' : statsError ? 'X' : statsData.exited },
  ];

  const getCurrentPageTitle = () => {
    if (location.pathname === '/vms/home' || location.pathname === '/vms') {
      return "Welcome to TimesGlobal Visitor Management System !!!";
    }
    const currentNavItem = sidebarNavItems.find(item => location.pathname.startsWith(item.path)); // Use startsWith for potential sub-routes not in nav
    return currentNavItem ? currentNavItem.name : "Visitor Management System"; // Default title
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
          id="vms-sidebar"
        >
          <div className="p-5 border-b border-gray-700">
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
          
          {/* Logo Section */}
          <div className="p-4 flex justify-center items-center">
            <img
              src="/images/Times Global.png"
              alt="Times Global Logo"
              className="h-16 w-auto" 
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
          <header className="bg-red-700 bg-opacity-80 backdrop-blur-md shadow-md text-white p-4 sticky top-0 z-10">
            <div className="container mx-auto flex items-center justify-between">
              <button 
                className="md:hidden text-white p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-expanded={isSidebarOpen}
                aria-controls="vms-sidebar"
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
              <h2 className="text-lg font-semibold text-center flex-grow md:text-center">{getCurrentPageTitle()}</h2>
              <div className="w-6 md:hidden"></div> 
            </div>
          </header>

          {showStatsBar && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              {statsToDisplay.map((stat: StatDisplayItem) => (
                <div key={stat.title} className="bg-slate-700 bg-opacity-60 backdrop-blur-sm p-5 rounded-lg shadow-xl text-center">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.title}</h4>
                  <p className="text-4xl font-bold text-red-500 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
          {showStatsBar && statsError && <p className="text-red-400 text-center py-2 bg-slate-800 bg-opacity-70 backdrop-blur-md">{statsError}</p>}

          <main className={`flex-grow p-5 overflow-y-auto ${showStatsBar ? '' : 'pt-0'}`}>
            <Outlet />
          </main>
          
          <footer className="bg-slate-800 bg-opacity-70 backdrop-blur-md p-3 text-center text-gray-300 text-xs">
            © {new Date().getFullYear()} Times Global Visitor Management. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VMSDashboardLayout;
