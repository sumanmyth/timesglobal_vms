import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface DeviceStorageFormProps {
  onLogout: () => void;
}

interface StorageItem {
  id: string;
  sno: string;
  quantity: string;
  description: string;
  rackNo: string;
  remarks: string;
}

type StorageItemPayload = Omit<StorageItem, 'id'>;

const DeviceStorageForm: React.FC<DeviceStorageFormProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string>('Times Global');
  const [date, setDate] = useState<string>('');
  const [officeAddress, setOfficeAddress] = useState<string>('Main Office Address');
  
  const [items, setItems] = useState<StorageItem[]>([
    { id: Date.now().toString(), sno: '', quantity: '', description: '', rackNo: '', remarks: '' }
  ]);

  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterCompanyName, setSubmitterCompanyName] = useState<string>('');
  const [submitterDesignation, setSubmitterDesignation] = useState<string>('');
  const [submitterContact, setSubmitterContact] = useState<string>('');
  const [submitterSignature, setSubmitterSignature] = useState<string>('');
  const [preparedBySignature, setPreparedBySignature] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value);
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value);
  const handleOfficeAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => setOfficeAddress(e.target.value);
  const handleSubmitterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setSubmitterName(e.target.value);
  const handleSubmitterCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setSubmitterCompanyName(e.target.value);
  const handleSubmitterDesignationChange = (e: React.ChangeEvent<HTMLInputElement>) => setSubmitterDesignation(e.target.value);
  const handleSubmitterContactChange = (e: React.ChangeEvent<HTMLInputElement>) => setSubmitterContact(e.target.value);
  const handleSubmitterSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => setSubmitterSignature(e.target.value);
  const handlePreparedBySignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => setPreparedBySignature(e.target.value);


  const handleAddItemRow = () => {
    setItems((prevItems: StorageItem[]) => [...prevItems, { id: Date.now().toString(), sno: '', quantity: '', description: '', rackNo: '', remarks: '' }]);
  };

  const handleRemoveItemRow = (id: string) => {
    setItems((prevItems: StorageItem[]) => prevItems.filter((item: StorageItem) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof StorageItemPayload, value: string) => {
    setItems((prevItems: StorageItem[]) => 
      prevItems.map((item: StorageItem) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const itemsPayload: StorageItemPayload[] = items.map(({ id, ...rest }) => rest);

    const formData = {
      company_name: companyName,
      date,
      office_address: officeAddress,
      items: itemsPayload,
      submitter_name: submitterName,
      submitter_company_name: submitterCompanyName,
      submitter_designation: submitterDesignation,
      submitter_contact: submitterContact,
      submitter_signature: submitterSignature,
      prepared_by_signature: preparedBySignature
    };

    try {
      await apiService.post('/device-storage/', formData); 
      setSuccessMessage('Device storage form submitted successfully!');
    } catch (err: any) {
      console.error('Device Storage Form Submission Error:', err);
      setError(err.message || err.detail || 'Failed to submit device storage form.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/dashboard')} variant="secondary" className="!px-4 !py-2">
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-red-600">Times Global</h1>
              <p className="text-gray-400">Management Software</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="secondary">
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 md:p-8">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-red-500 mb-8">Device Storage Form</h2>

          {error && <p role="alert" aria-live="assertive" className="mb-4 text-center text-red-400 bg-red-900 p-3 rounded">{error}</p>}
          {successMessage && <p role="alert" aria-live="polite" className="mb-4 text-center text-green-400 bg-green-900 p-3 rounded">{successMessage}</p>}

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Company & Entry Details</h3>
            <div className="mt-4 grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">NAME OF OUR COMPANY:</label>
                <Input id="companyName" name="companyName" type="text" value={companyName} onChange={handleCompanyNameChange} placeholder="Times Global" />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">DATE:</label>
                <Input id="date" name="date" type="date" value={date} onChange={handleDateChange} placeholder="dd/mm/yyyy" required/>
              </div>
              <div>
                <label htmlFor="officeAddress" className="block text-sm font-medium text-gray-300 mb-1">REGISTERED OFFICE ADDRESS:</label>
                <Input id="officeAddress" name="officeAddress" type="text" value={officeAddress} onChange={handleOfficeAddressChange} placeholder="Main Office Address" />
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Items for Storage</h3>
            <div className="mt-4 space-y-4">
              <div className="hidden md:grid grid-cols-[minmax(60px,0.5fr)_1fr_2fr_1fr_2fr_minmax(100px,0.7fr)] gap-2 text-sm font-medium text-gray-300 px-2 py-1 border-b border-gray-700">
                <span>S.NO.</span>
                <span>QUANTITY</span>
                <span>ITEM DESCRIPTION</span>
                <span>RACK NO.</span>
                <span>REMARKS</span>
                <span>ACTION</span>
              </div>
              {items.map((item: StorageItem, index: number) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[minmax(60px,0.5fr)_1fr_2fr_1fr_2fr_minmax(100px,0.7fr)] gap-3 items-center bg-gray-700/50 p-3 rounded">
                  <Input aria-label="Serial Number" type="text" placeholder="No." value={item.sno} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'sno', e.target.value)} className="!py-2" />
                  <Input aria-label="Quantity" type="number" placeholder="Qty" value={item.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'quantity', e.target.value)} className="!py-2" />
                  <Input aria-label="Item Description" type="text" placeholder="Device Name/Model" value={item.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'description', e.target.value)} className="!py-2" required />
                  <Input aria-label="Rack Number" type="text" placeholder="Rack/Locker" value={item.rackNo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'rackNo', e.target.value)} className="!py-2" />
                  <Input aria-label="Remarks" type="text" placeholder="Notes" value={item.remarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'remarks', e.target.value)} className="!py-2" />
                  <Button type="button" onClick={() => handleRemoveItemRow(item.id)} className="bg-red-600 hover:bg-red-700 text-white !py-2 w-full md:w-auto" disabled={items.length <= 1}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" onClick={handleAddItemRow} className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full">
              ADD ITEM ROW
            </Button>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Submitter Information</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="submitterName" className="block text-sm font-medium text-gray-300 mb-1">NAME:</label>
                <Input id="submitterName" name="submitterName" type="text" value={submitterName} onChange={handleSubmitterNameChange} placeholder="Enter name" required/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="submitterCompanyName" className="block text-sm font-medium text-gray-300 mb-1">COMPANY NAME:</label>
                <Input id="submitterCompanyName" name="submitterCompanyName" type="text" value={submitterCompanyName} onChange={handleSubmitterCompanyNameChange} placeholder="Enter company name"/>
              </div>
              <div>
                <label htmlFor="submitterDesignation" className="block text-sm font-medium text-gray-300 mb-1">DESIGNATION:</label>
                <Input id="submitterDesignation" name="submitterDesignation" type="text" value={submitterDesignation} onChange={handleSubmitterDesignationChange} placeholder="Enter designation"/>
              </div>
              <div>
                <label htmlFor="submitterContact" className="block text-sm font-medium text-gray-300 mb-1">CONTACT NUMBER:</label>
                <Input id="submitterContact" name="submitterContact" type="text" value={submitterContact} onChange={handleSubmitterContactChange} placeholder="Enter contact number"/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="submitterSignature" className="block text-sm font-medium text-gray-300 mb-1">SIGNATURE (TYPE NAME):</label>
                <Input id="submitterSignature" name="submitterSignature" type="text" value={submitterSignature} onChange={handleSubmitterSignatureChange} placeholder="Type full name for signature" required/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="preparedBySignature" className="block text-sm font-medium text-gray-300 mb-1">PREPARED BY SIGNATURE (TYPE NAME):</label>
                <Input id="preparedBySignature" name="preparedBySignature" type="text" value={preparedBySignature} onChange={handlePreparedBySignatureChange} placeholder="Type full name for signature" required/>
              </div>
            </div>
          </section>

          <div className="mt-10 text-center">
            <Button type="submit" className="w-full md:w-auto bg-red-700 hover:bg-red-800 text-white text-lg px-10 py-3" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'SAVE & GENERATE RECEIPT'}
            </Button>
          </div>
        </form>
      </main>

      <footer className="bg-gray-800 p-4 text-center text-gray-500 text-sm mt-auto">
        © {new Date().getFullYear()} Times Global Data Centre. All rights reserved.
      </footer>
    </div>
  );
};

export default DeviceStorageForm;