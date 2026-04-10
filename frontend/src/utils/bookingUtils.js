/**
 * Normalizes datetime-local values to LocalDateTime-style ISO strings (no timezone)
 * expected by the API.
 */
export function toIsoLocalDateTime(value) {
  if (!value) return '';
  if (value.length === 16) return `${value}:00`;
  return value;
}

export function formatBookingRange(startTime, endTime) {
  if (!startTime || !endTime) return '—';
  const opts = { dateStyle: 'medium', timeStyle: 'short' };
  try {
    return `${new Date(startTime).toLocaleString(undefined, opts)} → ${new Date(endTime).toLocaleString(undefined, opts)}`;
  } catch {
    return `${startTime} → ${endTime}`;
  }
}

export const BOOKING_STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

/** Admin rejection text (API camelCase or legacy/snake keys). */
export function getRejectionReasonText(booking) {
  if (!booking) return '';
  return (
    booking.rejectionReason ||
    booking.rejection_reason ||
    booking.rejectReason ||
    booking.reject_reason ||
    ''
  );
}
