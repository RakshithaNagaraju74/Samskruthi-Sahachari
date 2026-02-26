// components/QRScanner.tsx
import { useState } from 'react';
import QrReader from 'react-qr-reader';
import api from '@/services/api';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState('');
  const [message, setMessage] = useState('');

  const handleScan = async (data: string | null) => {
    if (data) {
      setScanResult(data);
      try {
        // The QR code contains the ticket number
        const response = await api.post(`/tickets/${data}/use`);
        setMessage(response.data.message);
      } catch (error: any) {
        setMessage(error.response?.data?.message || 'Error processing ticket');
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  return (
    <div>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />
      {message && (
        <div className={`mt-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}