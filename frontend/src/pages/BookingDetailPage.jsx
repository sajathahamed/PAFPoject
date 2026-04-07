import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../api/booking';
import { useAuth } from '../context/AuthContext';

const BookingDetailPage = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await bookingAPI.getById(id);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleApprove = async () => {
    try {
      await bookingAPI.approve(id);
      setBooking(prev => ({ ...prev, status: 'APPROVED' }));
    } catch (error) {
      alert('Error approving booking');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await bookingAPI.reject(id, rejectionReason);
      setBooking(prev => ({ ...prev, status: 'REJECTED', rejectionReason }));
    } catch (error) {
      alert('Error rejecting booking');
    }
  };

  const handleCancel = async () => {
    try {
      await bookingAPI.cancel(id);
      setBooking(prev => ({ ...prev, status: 'CANCELLED' }));
    } catch (error) {
      alert('Error cancelling booking');
    }
  };

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
  if (!booking) return <div className="text-center py-8">Booking not found</div>;

  const canApproveReject = user && user.role === 'ADMIN' && booking.status === 'PENDING';
  const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{booking.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold">Resource:</label>
              <p>{booking.resource}</p>
            </div>

            <div>
              <label className="font-semibold">Description:</label>
              <p>{booking.description}</p>
            </div>

            <div>
              <label className="font-semibold">Start Time:</label>
              <p>{new Date(booking.startTime).toLocaleString()}</p>
            </div>

            <div>
              <label className="font-semibold">End Time:</label>
              <p>{new Date(booking.endTime).toLocaleString()}</p>
            </div>

            {booking.recurring && (
              <div>
                <label className="font-semibold">Recurring:</label>
                <p>{booking.recurrencePattern}</p>
              </div>
            )}

            {booking.status === 'REJECTED' && booking.rejectionReason && (
              <div>
                <label className="font-semibold">Rejection Reason:</label>
                <p className="text-red-600">{booking.rejectionReason}</p>
              </div>
            )}

            <div>
              <label className="font-semibold">Created:</label>
              <p>{new Date(booking.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="font-semibold">Updated:</label>
              <p>{new Date(booking.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            {canApproveReject && (
              <>
                <button
                  onClick={handleApprove}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Approve
                </button>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <button
                    onClick={handleReject}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}

            {canCancel && (
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            )}

            <button
              onClick={() => navigate('/bookings')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;