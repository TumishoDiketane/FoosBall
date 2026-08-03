export default function FoosballTable() {
  return (
    <div className="foosball-table">
      <svg viewBox="0 0 600 300" className="foosball-svg">
        <defs>
          <linearGradient id="felt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f7a4d" />
            <stop offset="100%" stopColor="#155c3a" />
          </linearGradient>
          <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a5a34" />
            <stop offset="100%" stopColor="#6b4326" />
          </linearGradient>
        </defs>

        {/* Table frame */}
        <rect x="0" y="0" width="600" height="300" rx="14" fill="url(#wood)" />
        {/* Playing field */}
        <rect x="20" y="20" width="560" height="260" rx="6" fill="url(#felt)" />

        {/* Center line */}
        <line x1="300" y1="20" x2="300" y2="280" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        <circle cx="300" cy="150" r="35" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

        {/* Goals */}
        <rect x="8" y="115" width="14" height="70" fill="#111" opacity="0.6" />
        <rect x="578" y="115" width="14" height="70" fill="#111" opacity="0.6" />

        {/* --- Rods (each g slides via CSS animation) --- */}

        {/* Red goalie rod */}
        <g className="rod rod-red rod-1">
          <line x1="60" y1="20" x2="60" y2="280" stroke="#333" strokeWidth="4" opacity="0.5" />
          <circle cx="60" cy="150" r="9" className="player red" />
        </g>

        {/* Red defense rod */}
        <g className="rod rod-red rod-2">
          <line x1="140" y1="20" x2="140" y2="280" stroke="#333" strokeWidth="4" opacity="0.5" />
          <circle cx="140" cy="90" r="9" className="player red" />
          <circle cx="140" cy="150" r="9" className="player red" />
          <circle cx="140" cy="210" r="9" className="player red" />
        </g>

        {/* Blue attack rod */}
        <g className="rod rod-blue rod-3">
          <line x1="460" y1="20" x2="460" y2="280" stroke="#333" strokeWidth="4" opacity="0.5" />
          <circle cx="460" cy="90" r="9" className="player blue" />
          <circle cx="460" cy="150" r="9" className="player blue" />
          <circle cx="460" cy="210" r="9" className="player blue" />
        </g>

        {/* Blue goalie rod */}
        <g className="rod rod-blue rod-4">
          <line x1="540" y1="20" x2="540" y2="280" stroke="#333" strokeWidth="4" opacity="0.5" />
          <circle cx="540" cy="150" r="9" className="player blue" />
        </g>

        {/* Ball */}
        <circle r="6" fill="#fdf6e3" stroke="#c9a227" strokeWidth="1" className="ball" />
      </svg>

      <style>{`
        .foosball-table {
          width: 100%;
          max-width: 480px;
          margin: 0 auto 1.5rem;
        }
        .foosball-svg {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.35));
        }
        .player {
          transition: transform 0.2s ease;
        }
        .player.red { fill: #d94b3f; stroke: #7a1f16; stroke-width: 1.5; }
        .player.blue { fill: #3f7fd9; stroke: #163a7a; stroke-width: 1.5; }

        /* Rods slide up/down along their line */
        .rod-1 { animation: slideShort 2.4s ease-in-out infinite; }
        .rod-2 { animation: slideLong 3.1s ease-in-out infinite; }
        .rod-3 { animation: slideLong 2.7s ease-in-out infinite reverse; }
        .rod-4 { animation: slideShort 1.9s ease-in-out infinite reverse; }

        @keyframes slideShort {
          0%, 100% { transform: translateY(-40px); }
          50% { transform: translateY(40px); }
        }
        @keyframes slideLong {
          0%, 100% { transform: translateY(-55px); }
          50% { transform: translateY(55px); }
        }

        /* Ball bounces around the field in a loop */
        .ball {
          offset-path: path("M 100 100 L 500 200 L 150 220 L 450 80 L 100 100");
          animation: ballMove 5s linear infinite;
        }
        @keyframes ballMove {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .rod-1, .rod-2, .rod-3, .rod-4, .ball {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}