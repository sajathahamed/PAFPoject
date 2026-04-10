import { AlertTriangle } from 'lucide-react';
import { formatBookingRange } from '../utils/bookingUtils';

/**
 * Shown when GET /bookings/conflict reports overlapping bookings.
 */
export default function ConflictWarning({
  conflicts,
  title = 'Scheduling conflict',
  intro = 'This resource is already booked for part of the selected window. Adjust the time or pick another resource.',
}) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="conflict-warning" role="alert">
      <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
      <div>
        <div className="conflict-warning-title">{title}</div>
        <p style={{ margin: '0 0 8px', fontSize: 13 }}>
          {intro}
        </p>
        <ul>
          {conflicts.map((c) => (
            <li key={c.id}>
              {formatBookingRange(c.startTime, c.endTime)}
              {c.userName ? ` — ${c.userName}` : ''}
              {c.status ? ` (${c.status})` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
