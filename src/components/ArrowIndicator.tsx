import React from 'react';

interface ArrowIndicatorProps {
  angle: number; // radians - angle to rotate arrow
  distanceMeters: number; // distance to beacon in meters
  visible?: boolean; // whether to show the indicator
}

export function ArrowIndicator({ angle, distanceMeters, visible = true }: ArrowIndicatorProps) {
  if (!visible) return null;

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1) {
      return `${Math.round(meters * 100)} cm`;
    }
    return `${Math.round(meters * 10) / 10} m`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Arrow */}
      <div
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${angle}rad)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 8 L20 32 M12 20 L20 12 M28 20 L20 12"
            stroke="#00d9ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {/* Distance label */}
      <div
        style={{
          marginTop: 4,
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: 8,
          border: '1px solid rgba(0, 217, 255, 0.5)',
        }}
      >
        <span
          style={{
            color: '#00d9ff',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {formatDistance(distanceMeters)}
        </span>
      </div>
    </div>
  );
}

