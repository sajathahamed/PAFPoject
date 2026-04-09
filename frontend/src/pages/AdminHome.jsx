import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../api/booking';
import { useAuth } from '../context/AuthContext';

export default function AdminHome() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getAll();
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (id) => {
    try {
      await bookingAPI.approve(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'APPROVED' } : b));
    } catch (error) {
      alert('Error approving booking');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await bookingAPI.reject(id, reason);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED', rejectionReason: reason } : b));
    } catch (error) {
      alert('Error rejecting booking');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard - All Bookings</h1>
        <div className="flex gap-4 items-center">
          <Link to="/admin/resources" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Manage Resources
          </Link>
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{booking.resource}</h3>
                  <p className="text-gray-600">Requested by: {booking.user?.name || 'Unknown'}</p>
                  <p className="text-gray-600">Start: {new Date(booking.startTime).toLocaleString()}</p>
                  <p className="text-gray-600">End: {new Date(booking.endTime).toLocaleString()}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.rejectionReason && <p className="text-red-600">Reason: {booking.rejectionReason}</p>}
                </div>
                <div className="flex gap-2">
                  <Link to={`/bookings/${booking.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                    View Details
                  </Link>
                  {booking.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleApprove(booking.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                        Approve
                      </button>
                      <button onClick={() => handleReject(booking.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
