import React, { useState, useCallback }  from 'react'; // Removed useEffect as it's not used directly
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface TaskReportEntry {
  id: string;
  job_id: string;
  job_date: string;
  job_title: string;
  full_name: string;
  company_name: string;
  rack_number: string;
  encoded_by: string;
  company_location?: string;
  job_description?: string;
  contact?: string;
  is_completed: boolean; 
  completed_at?: string | null; 
  created_at: string;
  updated_at: string;
}

const TaskManagementReportsPage: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reportData, setReportData] = useState<TaskReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);


  const fetchReportData = useCallback(async () => { // fetchReportData is defined but only called by handleGenerateReport
    if (!fromDate || !toDate) {
      setError("Please select both Start Date and End Date to generate a report.");
      setReportData([]);
      setHasSearched(true); // Mark that an attempt was made
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
        setError('"From" date cannot be after "To" date.');
        setReportData([]);
        setHasSearched(true); // Mark that an attempt was made
        setIsLoading(false); // Ensure loading is false if returning early
        return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const queryParams = new URLSearchParams();
      // Backend expects job_date__gte and job_date__lte for date range filtering for Tasks
      queryParams.append('job_date__gte', fromDate); 
      queryParams.append('job_date__lte', toDate);

      // The /task-management/tasks/ endpoint with these params should filter by date range
      // apiService.get will automatically append location_id if a location is selected
      const reportEntries = await apiService.getAll<TaskReportEntry>(`/task-management/tasks/?${queryParams.toString()}`);
      
      setReportData(reportEntries || []);

    } catch (err: any) {
      console.error('Generate Report Error:', err);
      const errorData = (err as { data?: any; message?: string })?.data;
      if (errorData && typeof errorData === 'object') {
        setError(errorData.detail || JSON.stringify(errorData) || 'Failed to generate report.');
      } else {
        setError((err as Error)?.message || 'Failed to generate report.');
      }
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]); // Dependencies for useCallback


  const handleGenerateReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchReportData(); // Call the memoized fetch function
  };
  
  const formatDateForDisplay = (dateString: string | null | undefined, includeTime: boolean = false): string => {
    if (!dateString) return 'N/A';
    try {
        const dateObj = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric', month: '2-digit', day: '2-digit',
        };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            // options.second = '2-digit'; // Optional: include seconds
            options.hour12 = true;
        }
        // 'en-CA' format is YYYY-MM-DD, which is good for dates.
        // For datetime, toLocaleString with specific options can be better.
        return new Intl.DateTimeFormat('en-CA', options).format(dateObj).replace(',', ''); 
    } catch (e) {
        console.warn("Error formatting date for display:", dateString, e);
        // Fallback for basic YYYY-MM-DD strings if full parsing fails
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
            return dateString.split('T')[0]; 
        }
        return dateString; 
    }
};


  const inputStyles = "bg-slate-600 border-slate-500 text-gray-100 placeholder-gray-400 focus:ring-red-500 focus:border-red-500";
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";

  const tableHeaders = ['Job ID', 'Job Date', 'Job Title', 'Full Name', 'Company', 'Rack No.', 'Description', 'Contact', 'Encoded By', 'Status', 'Completed At', 'Created At'];


  return (
    <div className="h-full flex flex-col">
      <header className="bg-red-700 text-white py-3 px-6 shadow-md rounded-t-lg mb-4">
        <h2 className="text-2xl font-bold text-center">Generate Report</h2>
      </header>
      <div className="p-4 sm:p-6 bg-slate-700 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-inner_lg mb-4">
        <form onSubmit={handleGenerateReport} className="space-y-6 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <label htmlFor="fromDate" className={labelStyles}>From:<span className="text-red-400">*</span></label>
                <Input
                  type="date"
                  id="fromDate"
                  name="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={inputStyles + " w-full"}
                  required
                  aria-label="Report from date"
                />
              </div>
              <div className="text-gray-300 text-center sm:text-left hidden sm:block pb-2">To:</div>
               <div className="flex-1">
                <label htmlFor="toDate" className={`${labelStyles} sm:hidden`}>To:<span className="text-red-400">*</span></label>
                <Input
                  type="date"
                  id="toDate"
                  name="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={inputStyles + " w-full"}
                  required
                  aria-label="Report to date"
                />
              </div>
            </div>
            <Button type="submit" fullWidth className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
        </form>
      </div>

      <div className="flex-grow p-2 sm:p-4 bg-slate-700 bg-opacity-30 backdrop-blur-sm rounded-b-lg shadow-inner_lg overflow-x-auto">
        {isLoading && <p className="text-center text-gray-300 py-10">Loading report data...</p>}
        {error && <p role="alert" aria-live="assertive" className="text-center text-red-400 bg-red-900/50 p-3 rounded m-2">{error}</p>}
        
        {!isLoading && !error && hasSearched && reportData.length === 0 && (
          <p className="text-center text-gray-400 py-10">No tasks found for the selected date range.</p>
        )}
        {!isLoading && !error && !hasSearched && (
           <p className="text-center text-gray-400 py-10">Please select a date range and click "Generate Report".</p>
        )}

        {!isLoading && !error && reportData.length > 0 && (
          <div className="bg-slate-700 bg-opacity-60 backdrop-blur-md shadow-md rounded-lg overflow-hidden border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 p-3 border-b border-gray-700">
              Report: Tasks from {formatDateForDisplay(fromDate)} to {formatDateForDisplay(toDate)}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    {tableHeaders.map(header => (
                      <th key={header} scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-gray-700">
                  {reportData.map((task) => (
                    <tr key={task.id} className={`hover:bg-slate-700/70 transition-colors ${task.is_completed ? 'opacity-75' : ''}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{task.job_id}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{formatDateForDisplay(task.job_date)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-100 font-medium max-w-xs truncate" title={task.job_title}>{task.job_title}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{task.full_name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200 max-w-xs truncate" title={task.company_name}>{task.company_name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{task.rack_number}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200 max-w-[150px] truncate" title={task.job_description || undefined}>{task.job_description || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{task.contact || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{task.encoded_by}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {task.is_completed ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-600 text-green-100">Completed</span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500 text-yellow-100">Pending</span>
                        )}
                      </td>
                       <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{formatDateForDisplay(task.completed_at, true)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{formatDateForDisplay(task.created_at, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagementReportsPage;