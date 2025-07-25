import React, { useState, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface ReportEntry {
  id: string;
  visitorImage?: string;
  idNumberType: string;
  fullName: string;
  contact: string;
  email: string;
  reason: string;
  approvedBy: string;
  requestedBy: string;
  requestSource: string;
  checkInTime: string;
  checkOutTime?: string | null;
}

interface StoredImage {
  id: string;
  fullName: string;
  imageFile: string;
  idType: string;
}

const VMSReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedReport, setHasAttemptedReport] = useState<boolean>(false);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/40/CCCCCC/FFFFFF?Text=Error';
  };

  const fetchReportData = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Please select both Start Date and End Date to generate a report.");
      setReportData([]);
      setHasAttemptedReport(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setHasAttemptedReport(true);

    try {
      const queryParams = new URLSearchParams({
        start_date: startDate, 
        end_date: endDate,
      });
      const fetchedReportEntries = await apiService.getAll<ReportEntry>(`/visitors/report/?${queryParams.toString()}`);
      
      const reportEntriesWithImages: ReportEntry[] = await Promise.all(
        fetchedReportEntries.map(async (entry: ReportEntry) => {
          if (!entry.visitorImage && entry.fullName) { 
            try {
              const images = await apiService.getAll<StoredImage>(`/images/?search=${encodeURIComponent(entry.fullName)}`);
              if (images.length > 0 && images[0].imageFile) {
                return { ...entry, visitorImage: images[0].imageFile };
              }
            } catch (imgError) {
              console.warn(`Could not fetch image for report entry ${entry.fullName}:`, imgError);
            }
          }
          return entry;
        })
      );
      setReportData(reportEntriesWithImages);

    } catch (err: any) {
      console.error('Fetch Report Data Error:', err);
      setError(err.message || 'Failed to fetch report data.');
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]); 


  const handleGenerateReport = () => {
    fetchReportData();
  };
  
  const inputDarkStyle = "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-red-500 focus:border-red-500 !py-2";
  const labelStyles = "block text-xs font-medium text-gray-300 mb-1";

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      const dateObj = new Date(isoString);
      const date = dateObj.toLocaleDateString('en-CA'); 
      const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      return `${date}\n${time}`;
    } catch {
      return isoString;
    }
  };

  const tableHeaders: string[] = [
    'Image', 'ID Number/type', 'Full Name', 'Contact', 'Email', 
    'Reason', 'Approved By', 'Requested By', 'Request Source', 
    'Check-in Date and Time', 'Check-out Date and Time'
  ];


  return (
    <div className="flex flex-col h-full">
      <div className="bg-red-700 bg-opacity-75 backdrop-blur-sm text-white p-3 shadow-md">
        <h2 className="text-xl font-semibold text-center">Visitor Reports</h2>
      </div>

      <div className="p-2 sm:p-3 m-2 sm:m-3 bg-slate-700 bg-opacity-60 backdrop-blur-md rounded-lg shadow border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-2">
          <div className="w-full sm:w-auto sm:flex-1">
            <label htmlFor="startDate" className={labelStyles}>Start Date:</label>
            <Input type="date" id="startDate" value={startDate} onChange={handleStartDateChange} className={`${inputDarkStyle} w-full`} />
          </div>
          <div className="w-full sm:w-auto sm:flex-1">
            <label htmlFor="endDate" className={labelStyles}>End Date:</label>
            <Input type="date" id="endDate" value={endDate} onChange={handleEndDateChange} className={`${inputDarkStyle} w-full`} />
          </div>
          <Button 
            onClick={handleGenerateReport} 
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white !px-3 sm:!px-4 !py-2 text-sm" 
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>
      
      {error && !isLoading && <p role="alert" aria-live="assertive" className="p-3 text-center text-red-400 bg-red-900/50 rounded m-2">{error}</p>}

      <div className="flex-grow p-2 sm:p-3 overflow-x-auto">
        <div className="bg-slate-700 bg-opacity-60 backdrop-blur-md shadow-md rounded-lg overflow-hidden border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                {tableHeaders.map((header: string) => (
                  <th key={header} scope="col" className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={tableHeaders.length} className="px-3 py-10 text-center text-sm text-gray-400">Loading report data...</td></tr>
              ) : reportData.length > 0 ? reportData.map((entry: ReportEntry) => (
                <tr key={entry.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap">
                    {entry.visitorImage ? (
                      <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover" src={entry.visitorImage} alt={entry.fullName} 
                           onError={handleImageError} />
                    ) : (
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-gray-600 flex items-center justify-center text-gray-400 text-xs text-center">NoImg</div>
                    )}
                  </td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-gray-300">{entry.idNumberType}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs font-medium text-gray-100">{entry.fullName}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-gray-300">{entry.contact}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-gray-300 truncate max-w-[100px] sm:max-w-[150px]">{entry.email}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-gray-300">{entry.reason}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-gray-300">{entry.approvedBy}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-gray-300">{entry.requestedBy}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-gray-300">{entry.requestSource}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-pre-wrap text-xs text-gray-300 text-center">{formatDate(entry.checkInTime)}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-pre-wrap text-xs text-gray-300 text-center">{formatDate(entry.checkOutTime)}</td>
                </tr>
              )) : (
                <tr><td colSpan={tableHeaders.length} className="px-3 py-10 text-center text-sm text-gray-400">
                  {hasAttemptedReport && !error ? 'No report data available for the selected criteria.' : !hasAttemptedReport && !error ? 'Please select a date range and click \'Generate Report\' to view data.' : ''}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VMSReportsPage;