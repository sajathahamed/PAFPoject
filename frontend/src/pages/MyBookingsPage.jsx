import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../api/booking';
import { useAuth } from '../context/AuthContext';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getUserBookings(user.id);
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBookings();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Link
          to="/bookings/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Booking
        </Link>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{booking.title}</h3>
                <p className="text-gray-600">{booking.resource}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{booking.description}</p>

            <div className="text-sm text-gray-500 mb-4">
              <p>Start: {new Date(booking.startTime).toLocaleString()}</p>
              <p>End: {new Date(booking.endTime).toLocaleString()}</p>
              {booking.recurring && <p>Recurring: {booking.recurrencePattern}</p>}
            </div>

            <div className="flex space-x-2">
              <Link
                to={`/bookings/${booking.id}`}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                View Details
              </Link>
              {booking.status === 'PENDING' && (
                <button
                  onClick={async () => {
                    try {
                      await bookingAPI.cancel(booking.id);
                      setBookings(prev => prev.map(b =>
                        b.id === booking.id ? { ...b, status: 'CANCELLED' } : b
                      ));
                    } catch (error) {
                      alert('Error cancelling booking');
                    }
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Cancel
                </button>
              )}
              {booking.status === 'APPROVED' && (
                <button
                  onClick={async () => {
                    try {
                      await bookingAPI.cancel(booking.id);
                      setBookings(prev => prev.map(b =>
                        b.id === booking.id ? { ...b, status: 'CANCELLED' } : b
                      ));
                    } catch (error) {
                      alert('Error cancelling booking');
                    }
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings found. <Link to="/bookings/create" className="text-blue-500">Create one</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;