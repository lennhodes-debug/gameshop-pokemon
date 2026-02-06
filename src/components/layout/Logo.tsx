export default function Logo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Rounded hexagon outer */}
      <path
        d="M60 6 L106 28 Q116 33 116 44 L116 76 Q116 87 106 92 L60 114 L14 92 Q4 87 4 76 L4 44 Q4 33 14 28 Z"
        fill="url(#logoGrad)"
        filter="url(#logoShadow)"
      />
      {/* Inner hexagon G shape - matching the actual logo */}
      <path
        d="M70 58H62V66H76Q76 78 67 84Q58 90 49 84Q40 78 40 66V54Q40 42 49 36Q58 30 67 36Q72 39 74 43L66 47Q65 44 62 42Q58 39 54 42Q50 45 50 54V66Q50 75 54 78Q58 81 62 78Q66 75 66 66V62"
        fill="white"
      />
    </svg>
  );
}
