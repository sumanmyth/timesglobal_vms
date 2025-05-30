import React, { useState, useEffect, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface Visitor {
  id: string; 
  visitorImage?: string;
  idNumberType: string;
  fullName: string;
  checkInTime: string;
  checkOutTime?: string | null;
}

interface StoredImage {
  id: string;
  fullName: string;
  imageFile: string;
  idType: string;
}

interface ApiResponse<T> {
  results?: T[];
  [key: string]: any; 
}

const VMSVisitorListPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value);
  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value);
  const handleSearchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchName(e.target.value);
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/40/CCCCCC/FFFFFF?Text=Error';
  };

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('check_in_time_after', dateFrom); 
      if (dateTo) queryParams.append('check_in_time_before', dateTo);   
      if (searchName) queryParams.append('search', searchName); 

      const data = await apiService.get<Visitor[] | ApiResponse<Visitor>>(`/visitors/?${queryParams.toString()}`);
      let fetchedVisitors: Visitor[] = Array.isArray(data) ? data : (data.results || []);

      const visitorsWithImages: Visitor[] = await Promise.all(
        fetchedVisitors.map(async (visitor: Visitor) => {
          if (!visitor.visitorImage && visitor.fullName) { 
            try {
              const imageData = await apiService.get<StoredImage[] | ApiResponse<StoredImage>>(`/images/?search=${encodeURIComponent(visitor.fullName)}`);
              const images: StoredImage[] = Array.isArray(imageData) ? imageData : (imageData.results || []);
              if (images.length > 0 && images[0].imageFile) {
                return { ...visitor, visitorImage: images[0].imageFile };
              }
            } catch (imgError) {
              console.warn(`Could not fetch image for ${visitor.fullName}:`, imgError);
            }
          }
          return visitor;
        })
      );
      setVisitors(visitorsWithImages);

    } catch (err: any) {
      console.error('Fetch Visitors Error:', err);
      setError(err.message || 'Failed to fetch visitor list.');
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, searchName]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleFilterByDate = () => {
    fetchVisitors();
  };

  const handleSearchByName = () => {
    fetchVisitors();
  };

  const handleCheckOut = async (visitorId: string) => {
    if (!window.confirm('Are you sure you want to check out this visitor?')) return;
    try {
      const updatedVisitor = await apiService.patch<Visitor>(`/visitors/${visitorId}/checkout/`, {}); 
      setVisitors((prevVisitors: Visitor[]) => 
        prevVisitors.map((v: Visitor) => v.id === visitorId ? { ...v, checkOutTime: updatedVisitor.checkOutTime } : v)
      );
      alert('Visitor checked out successfully.');
    } catch (err: any) {
      console.error('Check-out error:', err);
      alert(`Failed to check out visitor: ${err.message || err.detail}`);
    }
  };
  
  const handleAction = (visitorId: string, action: string) => {
    console.log(`Action: ${action} for visitor ID: ${visitorId}`);
    if (action === 'Check-Out') {
        handleCheckOut(visitorId);
    } else {
        alert(`Action '${action}' not fully implemented yet.`);
    }
  };
  
  const inputDarkStyle = "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-red-500 focus:border-red-500 !py-2";
  const filterButtonSmallStyle = "!px-3 !py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-500";
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString; 
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="bg-red-700 text-white p-3 shadow-md">
        <h2 className="text-xl font-semibold text-center">Visitor List</h2>
      </div>

      <div className="p-4 m-4 bg-gray-800 rounded-lg shadow border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="flex items-end space-x-2">
            <div>
              <label htmlFor="dateFrom" className={labelStyles}>Date From:</label>
              <Input type="date" id="dateFrom" value={dateFrom} onChange={handleDateFromChange} className={inputDarkStyle} />
            </div>
            <div>
              <label htmlFor="dateTo" className={labelStyles}>Date To:</label>
              <Input type="date" id="dateTo" value={dateTo} onChange={handleDateToChange} className={inputDarkStyle} />
            </div>
            <Button onClick={handleFilterByDate} className={`${filterButtonSmallStyle} self-end mb-0.5`}>Filter by Date</Button>
          </div>
          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label htmlFor="searchName" className={labelStyles}>Search by Full Name:</label>
              <Input type="text" id="searchName" placeholder="Enter full name" value={searchName} onChange={handleSearchNameChange} className={inputDarkStyle + " w-full"} />
            </div>
            <Button onClick={handleSearchByName} className={`${filterButtonSmallStyle} self-end mb-0.5`}>Search by Name</Button>
          </div>
        </div>
      </div>

      {isLoading && <p className="p-4 text-center text-gray-300">Loading visitors...</p>}
      {error && <p role="alert" aria-live="assertive" className="p-4 text-center text-red-400 bg-red-900/50 rounded m-4">{error}</p>}
      
      {!isLoading && !error && (
        <div className="flex-grow p-4 overflow-x-auto">
          <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID Number/type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Check-In Time</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Check-Out Time</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {visitors.length > 0 ? visitors.map((visitor: Visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {visitor.visitorImage ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={visitor.visitorImage} alt={visitor.fullName} 
                             onError={handleImageError} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{visitor.idNumberType}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{visitor.fullName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{formatDate(visitor.checkInTime)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{formatDate(visitor.checkOutTime)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleAction(visitor.id, 'View')} className="text-red-400 hover:text-red-300 mr-2 transition-colors">View</button>
                      {!visitor.checkOutTime && (
                           <button onClick={() => handleAction(visitor.id, 'Check-Out')} className="text-blue-400 hover:text-blue-300 transition-colors">Check-Out</button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No visitors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VMSVisitorListPage;