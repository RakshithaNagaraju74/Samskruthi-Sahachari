// components/TicketCheckIn.tsx
import { useState } from 'react';
import api from '@/services/api'; // Add this import

interface TicketCheckInProps {
  ticketNumber: string;
  onCheckInSuccess?: () => void; // Callback prop instead of fetchTickets
}

export default function TicketCheckIn({ ticketNumber, onCheckInSuccess }: TicketCheckInProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');

  const handleSelfCheckIn = async () => {
    setIsChecking(true);
    setMessage('');
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setMessage('Geolocation is not supported by your browser');
        setIsChecking(false);
        return;
      }

      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Verify they're at the site (within radius)
            const response = await api.post('/tickets/self-checkin', {
              ticketNumber,
              latitude,
              longitude
            });
            
            if (response.data.success) {
              setMessage('✅ Check-in successful! Enjoy your visit!');
              // Call the callback if provided
              if (onCheckInSuccess) {
                onCheckInSuccess();
              }
            } else {
              setMessage(response.data.message || 'Check-in failed');
            }
          } catch (error: any) {
            setMessage(error.response?.data?.message || 'Check-in failed');
          } finally {
            setIsChecking(false);
          }
        },
        (error) => {
          // Handle geolocation errors
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setMessage('❌ Location permission denied. Please enable location access.');
              break;
            case error.POSITION_UNAVAILABLE:
              setMessage('❌ Location information is unavailable.');
              break;
            case error.TIMEOUT:
              setMessage('❌ Location request timed out.');
              break;
            default:
              setMessage('❌ An unknown error occurred.');
          }
          setIsChecking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Check-in failed:', error);
      setMessage('❌ Check-in failed. Please try again.');
      setIsChecking(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Check In at Site</h3>
      <p className="text-sm text-gray-500 mb-4">
        Please enable location services to check in when you arrive at the site.
      </p>
      
      <button
        onClick={handleSelfCheckIn}
        disabled={isChecking}
        className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChecking ? 'Checking in...' : 'Check In Now'}
      </button>
      
      {message && (
        <div className={`mt-3 p-2 text-sm rounded ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 
          message.includes('❌') ? 'bg-red-100 text-red-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}