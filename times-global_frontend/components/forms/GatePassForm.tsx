import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface GatePassFormProps {
  onLogout: () => void;
}

interface GatePassItem {
  id: string;
  sno: string;
  itemName: string;
  description: string;
  quantity: string;
  remarks: string;
}

type GatePassItemPayload = Omit<GatePassItem, 'id'>;

const GatePassForm: React.FC<GatePassFormProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  
  const [items, setItems] = useState<GatePassItem[]>([
    { id: Date.now().toString(), sno: '', itemName: '', description: '', quantity: '', remarks: '' }
  ]);

  const [preparedBy, setPreparedBy] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('');
  const [approvedBy, setApprovedBy] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRecipientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setRecipientName(e.target.value);
  const handleRecipientAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => setRecipientAddress(e.target.value);
  const handlePreparedByChange = (e: React.ChangeEvent<HTMLInputElement>) => setPreparedBy(e.target.value);
  const handleReceivedByChange = (e: React.ChangeEvent<HTMLInputElement>) => setReceivedBy(e.target.value);
  const handleApprovedByChange = (e: React.ChangeEvent<HTMLInputElement>) => setApprovedBy(e.target.value);

  const handleAddItemRow = () => {
    setItems((prevItems: GatePassItem[]) => [...prevItems, { id: Date.now().toString(), sno: '', itemName: '', description: '', quantity: '', remarks: '' }]);
  };

  const handleRemoveItemRow = (id: string) => {
    setItems((prevItems: GatePassItem[]) => prevItems.filter((item: GatePassItem) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof GatePassItemPayload, value: string) => {
    setItems((prevItems: GatePassItem[]) =>
      prevItems.map((item: GatePassItem) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const itemsPayload: GatePassItemPayload[] = items.map(({ id, ...rest }) => rest);

    const formData = {
      recipient_name: recipientName,
      recipient_address: recipientAddress,
      items: itemsPayload,
      prepared_by: preparedBy,
      received_by: receivedBy,
      approved_by: approvedBy,
    };

    try {
      await apiService.post('/gate-passes/', formData);
      setSuccessMessage('Gate Pass form submitted successfully!');
    } catch (err: any) {
      console.error('Gate Pass Form Submission Error:', err);
      setError(err.message || err.detail || 'Failed to submit gate pass form.');
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
          <h2 className="text-3xl font-semibold text-center text-red-500 mb-8">Create Gatepass</h2>
          
          {error && <p role="alert" aria-live="assertive" className="mb-4 text-center text-red-400 bg-red-900 p-3 rounded">{error}</p>}
          {successMessage && <p role="alert" aria-live="polite" className="mb-4 text-center text-green-400 bg-green-900 p-3 rounded">{successMessage}</p>}

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Recipient Details</h3>
            <div className="mt-4 grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium text-gray-300 mb-1">MR/MRS.:</label>
                <Input id="recipientName" name="recipientName" type="text" value={recipientName} onChange={handleRecipientNameChange} placeholder="Recipient's Full Name" required/>
              </div>
              <div>
                <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-300 mb-1">ADDRESS:</label>
                <Input id="recipientAddress" name="recipientAddress" type="text" value={recipientAddress} onChange={handleRecipientAddressChange} placeholder="Recipient's Address" />
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Items Details</h3>
            <div className="mt-4 space-y-4">
              <div className="hidden md:grid grid-cols-[minmax(60px,0.5fr)_1.5fr_2fr_1fr_1.5fr_minmax(100px,0.7fr)] gap-2 text-sm font-medium text-gray-300 px-2 py-1 border-b border-gray-700">
                <span>S.NO.</span>
                <span>ITEM</span>
                <span>DESCRIPTION</span>
                <span>QUANTITY</span>
                <span>REMARKS</span>
                <span>ACTION</span>
              </div>
              {items.map((item: GatePassItem, index: number) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[minmax(60px,0.5fr)_1.5fr_2fr_1fr_1.5fr_minmax(100px,0.7fr)] gap-3 items-center bg-gray-700/50 p-3 rounded">
                  <Input aria-label="Serial Number" type="text" placeholder="No." value={item.sno} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'sno', e.target.value)} className="!py-2" />
                  <Input aria-label="Item Name" type="text" placeholder="Item name" value={item.itemName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'itemName', e.target.value)} className="!py-2" required />
                  <Input aria-label="Description" type="text" placeholder="Description" value={item.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'description', e.target.value)} className="!py-2" />
                  <Input aria-label="Quantity" type="number" placeholder="Qty" value={item.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'quantity', e.target.value)} className="!py-2" required />
                  <Input aria-label="Remarks" type="text" placeholder="Remarks" value={item.remarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'remarks', e.target.value)} className="!py-2" />
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
            <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Approval Details</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="preparedBy" className="block text-sm font-medium text-gray-300 mb-1">PREPARED BY:</label>
                <Input id="preparedBy" name="preparedBy" type="text" value={preparedBy} onChange={handlePreparedByChange} placeholder="Name of preparer" required/>
              </div>
              <div>
                <label htmlFor="receivedBy" className="block text-sm font-medium text-gray-300 mb-1">RECEIVED BY:</label>
                <Input id="receivedBy" name="receivedBy" type="text" value={receivedBy} onChange={handleReceivedByChange} placeholder="Name of receiver" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="approvedBy" className="block text-sm font-medium text-gray-300 mb-1">APPROVED BY:</label>
                <Input id="approvedBy" name="approvedBy" type="text" value={approvedBy} onChange={handleApprovedByChange} placeholder="Name of approver" required/>
              </div>
            </div>
          </section>

          <div className="mt-10 text-center">
            <Button type="submit" className="w-full md:w-auto bg-red-700 hover:bg-red-800 text-white text-lg px-10 py-3" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'SAVE & GENERATE PASS'}
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

export default GatePassForm;