export default function Logo({ className = 'h-10 w-10', id = '' }: { className?: string; id?: string }) {
  const gradId = `logoGrad${id}`;
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={gradId} x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="45%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      {/* Rounded hexagon - very smooth corners matching the actual logo */}
      <path
        d="M100 10
           C106 10 112 13 116 16
           L168 46
           C176 50 180 58 180 66
           L180 134
           C180 142 176 150 168 154
           L116 184
           C112 187 106 190 100 190
           C94 190 88 187 84 184
           L32 154
           C24 150 20 142 20 134
           L20 66
           C20 58 24 50 32 46
           L84 16
           C88 13 94 10 100 10Z"
        fill={`url(#${gradId})`}
      />
      {/* White G with hexagonal inner shape */}
      <path
        d="M118 96H104V108H128
           C128 108 130 128 120 138
           C110 148 96 148 86 140
           C76 132 72 120 72 108
           V92
           C72 80 76 68 86 60
           C96 52 110 52 120 62
           C124 66 126 70 128 74
           L116 80
           C114 76 112 73 108 70
           C102 64 94 66 90 70
           C86 74 84 82 84 92
           V108
           C84 118 86 126 90 130
           C94 134 102 136 108 130
           C114 124 116 116 116 108
           V100"
        fill="white"
      />
    </svg>
  );
}
