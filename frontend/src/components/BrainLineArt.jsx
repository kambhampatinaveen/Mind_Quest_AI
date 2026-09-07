export default function BrainLineArt({ size = 130 }) {
  return (
    <div className="brain-lineart-container" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        className="neon-lineart-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="cyanNeon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" filter="url(#cyanNeon)">
          {/* Left hemisphere outlines */}
          <path d="M 76 30 C 50 30, 25 50, 24 75 C 23 100, 40 125, 65 130 C 73 132, 76 122, 76 115" />
          <path d="M 45 48 C 36 62, 42 78, 60 72 C 68 70, 75 60, 75 48" />
          <path d="M 30 72 C 34 88, 54 88, 52 100 C 50 110, 65 110, 70 102" />
          <path d="M 38 95 C 42 108, 55 116, 68 120" />

          {/* Right hemisphere outlines */}
          <path d="M 84 30 C 110 30, 135 50, 136 75 C 137 100, 120 125, 95 130 C 87 132, 84 122, 84 115" />
          <path d="M 115 48 C 124 62, 118 78, 100 72 C 92 70, 85 60, 85 48" />
          <path d="M 130 72 C 126 88, 106 88, 108 100 C 110 110, 95 110, 90 102" />
          <path d="M 122 95 C 118 108, 105 116, 92 120" />

          {/* Central fissure */}
          <line x1="80" y1="28" x2="80" y2="132" strokeDasharray="3 3" strokeWidth="1.8" opacity="0.6" />
        </g>

        {/* Neural connection dots */}
        <g fill="#38bdf8" filter="url(#cyanNeon)">
          <circle cx="45" cy="48" r="2.5" />
          <circle cx="60" cy="72" r="2" />
          <circle cx="34" cy="88" r="2.5" />
          <circle cx="115" cy="48" r="2.5" />
          <circle cx="100" cy="72" r="2" />
          <circle cx="126" cy="88" r="2.5" />
        </g>
      </svg>
    </div>
  );
}
