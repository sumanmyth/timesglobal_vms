import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

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

const idTypes: string[] = ['Visitor', 'Staff', 'Contractor', 'Other'];

const VMSAddImagePage: React.FC = () => {
  const [uploadFullName, setUploadFullName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadIdType, setUploadIdType] = useState<string>(idTypes[0]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUploadFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUploadFullName(e.target.value);
  const handleUploadIdTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setUploadIdType(e.target.value);
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/60x60/CCCCCC/FFFFFF?Text=Error';
  };


  const fetchStoredImages = useCallback(async () => {
    setIsTableLoading(true);
    setTableError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      const data = await apiService.get<StoredImage[] | ApiResponse<StoredImage>>(`/images/?${queryParams.toString()}`);
      setStoredImages(Array.isArray(data) ? data : (data.results || []));
    } catch (err: any) {
      console.error('Fetch Stored Images Error:', err);
      setTableError(err.message || 'Failed to fetch images.');
      setStoredImages([]);
    } finally {
      setIsTableLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchStoredImages();
  }, [fetchStoredImages]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleUploadImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFullName || !selectedFile || !uploadIdType) {
      setError('Please fill in all fields and select an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('fullName', uploadFullName);
    formData.append('imageFile', selectedFile); 
    formData.append('idType', uploadIdType);

    try {
      await apiService.post('/images/', formData, true); 
      setSuccessMessage(`Image for ${uploadFullName} (${uploadIdType}) uploaded successfully!`);
      fetchStoredImages(); 
      
      setUploadFullName('');
      setSelectedFile(null);
      setImagePreviewUrl(null);
      setUploadIdType(idTypes[0]);
      if (e.target instanceof HTMLFormElement) {
          const fileInput = e.target.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = "";
      }
    } catch (err: any) {
      console.error('Upload Image Error:', err);
      setError(err.message || err.detail || 'Failed to upload image.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchStoredImages(); 
  };

  const handleEdit = (id: string) => {
    console.log('Editing image ID:', id);
    alert(`Edit action for ID ${id}. (Full implementation would require an edit form/modal and PUT/PATCH request)`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image record?')) {
      try {
        await apiService.delete(`/images/${id}/`);
        setStoredImages((prev: StoredImage[]) => prev.filter((img: StoredImage) => img.id !== id));
        alert(`Image record ID ${id} deleted successfully.`);
      } catch (err: any) {
        console.error('Delete Image Error:', err);
        alert(`Failed to delete image record: ${err.message || err.detail}`);
      }
    }
  };

  const inputDarkStyle = "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-red-500 focus:border-red-500 !py-2";
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";
  const fileInputStyle = "block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-600 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="bg-red-700 text-white p-3 shadow-md">
        <h2 className="text-xl font-semibold text-center">Add Image</h2>
      </div>

      <div className="flex-grow p-4 space-y-6 overflow-y-auto">
        {error && <p role="alert" aria-live="assertive" className="text-center text-red-300 bg-red-800/70 p-3 rounded">{error}</p>}
        {successMessage && <p role="alert" aria-live="polite" className="text-center text-green-300 bg-green-800/70 p-3 rounded">{successMessage}</p>}
        
        <section className="p-6 bg-gray-800 rounded-lg shadow border border-gray-700">
          <form onSubmit={handleUploadImage} className="space-y-4">
            <div>
              <label htmlFor="uploadFullName" className={labelStyles}>Full Name:</label>
              <Input type="text" id="uploadFullName" value={uploadFullName} onChange={handleUploadFullNameChange} className={inputDarkStyle} placeholder="Enter person's full name" required />
            </div>
            <div>
              <label htmlFor="uploadImageFile" className={labelStyles}>Upload Image:</label>
              <input type="file" id="uploadImageFile" accept="image/*" onChange={handleFileChange} className={fileInputStyle} required />
              {imagePreviewUrl && <div className="mt-3 text-center"><img src={imagePreviewUrl} alt="Preview" className="inline-block h-32 w-32 object-cover rounded-md border border-gray-600" onError={handleImageError} /></div>}
            </div>
            <div>
              <label htmlFor="uploadIdType" className={labelStyles}>ID Type:</label>
              <select id="uploadIdType" value={uploadIdType} onChange={handleUploadIdTypeChange} className={`${inputDarkStyle} w-full !py-2.5`}>
                {idTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </form>
        </section>

        <section className="p-6 bg-gray-800 rounded-lg shadow border border-gray-700">
          <h3 className="text-lg font-semibold text-red-500 mb-3">Search by Full Name</h3>
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <Input type="text" value={searchTerm} onChange={handleSearchTermChange} className={`${inputDarkStyle} flex-grow`} placeholder="Enter full name to search" />
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white !px-6" disabled={isTableLoading}>
              {isTableLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </section>

        <section className="bg-gray-800 p-0 rounded-lg shadow border border-gray-700 overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-100 p-4 border-b border-gray-700">Stored Available Data</h3>
          {tableError && <p role="alert" aria-live="assertive" className="p-4 text-center text-red-400">{tableError}</p>}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Visitor Image</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {isTableLoading ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">Loading image data...</td></tr>
                ) : storedImages.length > 0 ? storedImages.map((image: StoredImage) => (
                  <tr key={image.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{image.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{image.fullName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <img src={image.imageFile} alt={image.fullName} className="h-12 w-12 object-cover rounded-md" onError={handleImageError}/>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{image.idType}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Button onClick={() => handleEdit(image.id)} className="!px-3 !py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white mr-2">Edit</Button>
                      <Button onClick={() => handleDelete(image.id)} className="!px-3 !py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white">Delete</Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">No image data found {searchTerm && 'for the current search'}.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VMSAddImagePage;