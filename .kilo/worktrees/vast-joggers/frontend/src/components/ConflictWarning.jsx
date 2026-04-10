import React from 'react';

const ConflictWarning = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <strong className="font-bold">Conflict Detected!</strong>
      <p className="block sm:inline">The following bookings conflict with your request:</p>
      <ul className="mt-2">
        {conflicts.map((conflict) => (
          <li key={conflict.id} className="text-sm">
            {conflict.title} - {new Date(conflict.startTime).toLocaleString()} to {new Date(conflict.endTime).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConflictWarning;