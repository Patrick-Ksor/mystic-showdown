// Inline SVG data URIs for monsters without sprite PNGs.
// Each is a themed geometric creature.

// ─── Electric ────────────────────────────────────────────────

export const STORMFIN_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="stfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <filter id="stfGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="178" rx="40" ry="6" fill="#ca8a0444"/>
  <ellipse cx="100" cy="95" rx="40" ry="50" fill="url(#stfGrad)" stroke="#ca8a04" stroke-width="1.5"/>
  <polygon points="100,15 108,45 115,10 110,40 120,20" fill="#facc15" stroke="#ca8a04" stroke-width="1" filter="url(#stfGlow)"/>
  <polygon points="60,70 30,55 50,75" fill="url(#stfGrad)" stroke="#ca8a04" stroke-width="1"/>
  <polygon points="140,70 170,55 150,75" fill="url(#stfGrad)" stroke="#ca8a04" stroke-width="1"/>
  <polygon points="65,105 25,120 55,110" fill="url(#stfGrad)" stroke="#ca8a04" stroke-width="1"/>
  <polygon points="135,105 175,120 145,110" fill="url(#stfGrad)" stroke="#ca8a04" stroke-width="1"/>
  <circle cx="85" cy="85" r="8" fill="#fff" opacity="0.95"/>
  <circle cx="115" cy="85" r="8" fill="#fff" opacity="0.95"/>
  <circle cx="85" cy="86" r="4" fill="#713f12"/>
  <circle cx="115" cy="86" r="4" fill="#713f12"/>
  <path d="M90 110 Q100 118 110 110" stroke="#713f12" stroke-width="1.5" fill="none"/>
  <polygon points="80,140 85,165 90,145 95,170 100,148 105,170 110,145 115,165 120,140" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
</svg>
`)}`;

// ─── Water ───────────────────────────────────────────────────

export const CORALITH_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="coralGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="50%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="180" rx="45" ry="8" fill="#0369a144"/>
  <path d="M100,25 Q145,35 150,80 Q155,130 130,160 L70,160 Q45,130 50,80 Q55,35 100,25" fill="url(#coralGlow)" stroke="#0369a1" stroke-width="2"/>
  <path d="M68,45 Q55,25 60,50" fill="#0ea5e9" stroke="#0369a1" stroke-width="1"/>
  <path d="M132,45 Q145,25 140,50" fill="#0ea5e9" stroke="#0369a1" stroke-width="1"/>
  <path d="M55,90 Q35,85 40,100 Q35,105 50,108" fill="#38bdf8" opacity="0.5"/>
  <path d="M145,90 Q165,85 160,100 Q165,105 150,108" fill="#38bdf8" opacity="0.5"/>
  <circle cx="82" cy="80" r="9" fill="#fff" opacity="0.9"/>
  <circle cx="118" cy="80" r="9" fill="#fff" opacity="0.9"/>
  <circle cx="82" cy="81" r="4.5" fill="#0c4a6e"/>
  <circle cx="118" cy="81" r="4.5" fill="#0c4a6e"/>
  <path d="M88 110 Q100 120 112 110" stroke="#0c4a6e" stroke-width="2" fill="none"/>
  <circle cx="70" cy="125" r="5" fill="#7dd3fc" opacity="0.3"/>
  <circle cx="130" cy="120" r="4" fill="#7dd3fc" opacity="0.3"/>
  <circle cx="90" cy="145" r="3" fill="#7dd3fc" opacity="0.2"/>
  <circle cx="115" cy="150" r="3.5" fill="#7dd3fc" opacity="0.2"/>
</svg>
`)}`;

// ─── Fire ────────────────────────────────────────────────────

export const CINDERBACK_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="cbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="40%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <filter id="cbGlow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="180" rx="55" ry="8" fill="#991b1b44"/>
  <ellipse cx="100" cy="110" rx="50" ry="55" fill="url(#cbGrad)" stroke="#991b1b" stroke-width="2"/>
  <path d="M75,60 Q65,30 78,55" fill="#fbbf24" stroke="#f59e0b" stroke-width="1" filter="url(#cbGlow)"/>
  <path d="M125,60 Q135,30 122,55" fill="#fbbf24" stroke="#f59e0b" stroke-width="1" filter="url(#cbGlow)"/>
  <path d="M100,58 Q95,25 105,58" fill="#fbbf24" stroke="#f59e0b" stroke-width="1" filter="url(#cbGlow)"/>
  <circle cx="82" cy="98" r="9" fill="#fef3c7" opacity="0.9"/>
  <circle cx="118" cy="98" r="9" fill="#fef3c7" opacity="0.9"/>
  <circle cx="82" cy="99" r="4.5" fill="#7f1d1d"/>
  <circle cx="118" cy="99" r="4.5" fill="#7f1d1d"/>
  <path d="M85 130 Q100 140 115 130" stroke="#7f1d1d" stroke-width="2.5" fill="none"/>
  <rect x="72" y="155" width="16" height="22" rx="6" fill="#991b1b"/>
  <rect x="112" y="155" width="16" height="22" rx="6" fill="#991b1b"/>
  <circle cx="60" cy="80" r="3" fill="#fbbf24" opacity="0.4" filter="url(#cbGlow)"/>
  <circle cx="140" cy="80" r="3" fill="#fbbf24" opacity="0.4" filter="url(#cbGlow)"/>
  <circle cx="100" cy="145" r="4" fill="#fbbf24" opacity="0.3" filter="url(#cbGlow)"/>
</svg>
`)}`;

// ─── Earth ───────────────────────────────────────────────────

export const QUARROX_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="qxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d6b06c"/>
      <stop offset="50%" stop-color="#a0845c"/>
      <stop offset="100%" stop-color="#6b5530"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="180" rx="55" ry="10" fill="#6b553044"/>
  <polygon points="100,20 155,60 170,120 150,165 50,165 30,120 45,60" fill="url(#qxGrad)" stroke="#6b5530" stroke-width="2"/>
  <polygon points="100,20 120,50 100,35 80,50" fill="#d6b06c88"/>
  <polygon points="70,80 55,65 60,85" fill="#a0845c" stroke="#6b5530" stroke-width="1" opacity="0.6"/>
  <polygon points="130,80 145,65 140,85" fill="#a0845c" stroke="#6b5530" stroke-width="1" opacity="0.6"/>
  <polygon points="85,130 75,145 95,140" fill="#a0845c" opacity="0.4"/>
  <polygon points="115,130 125,145 105,140" fill="#a0845c" opacity="0.4"/>
  <rect x="72" y="85" width="18" height="12" rx="3" fill="#3d2e10" opacity="0.85"/>
  <rect x="110" y="85" width="18" height="12" rx="3" fill="#3d2e10" opacity="0.85"/>
  <circle cx="79" cy="90" r="3" fill="#d6b06c" opacity="0.7"/>
  <circle cx="117" cy="90" r="3" fill="#d6b06c" opacity="0.7"/>
  <line x1="82" y1="112" x2="118" y2="112" stroke="#3d2e10" stroke-width="3" stroke-linecap="round"/>
  <polygon points="30,110 15,130 28,120" fill="url(#qxGrad)" stroke="#6b5530" stroke-width="1"/>
  <polygon points="170,110 185,130 172,120" fill="url(#qxGrad)" stroke="#6b5530" stroke-width="1"/>
</svg>
`)}`;

// ─── Ice ─────────────────────────────────────────────────────

export const FROSTMAW_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="fmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="50%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="fmGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="180" rx="45" ry="8" fill="#0284c744"/>
  <path d="M100,22 Q145,40 155,90 Q160,140 130,165 Q100,180 70,165 Q40,140 45,90 Q55,40 100,22" fill="url(#fmGrad)" stroke="#0284c7" stroke-width="1.5"/>
  <polygon points="65,40 50,15 62,38" fill="#bae6fd" stroke="#0284c7" stroke-width="1" filter="url(#fmGlow)"/>
  <polygon points="135,40 150,15 138,38" fill="#bae6fd" stroke="#0284c7" stroke-width="1" filter="url(#fmGlow)"/>
  <polygon points="55,25 45,5 56,28" fill="#bae6fd" stroke="#0284c7" stroke-width="0.5" opacity="0.6"/>
  <polygon points="145,25 155,5 144,28" fill="#bae6fd" stroke="#0284c7" stroke-width="0.5" opacity="0.6"/>
  <circle cx="82" cy="80" r="10" fill="#fff" opacity="0.95"/>
  <circle cx="118" cy="80" r="10" fill="#fff" opacity="0.95"/>
  <circle cx="82" cy="81" r="5" fill="#0c4a6e"/>
  <circle cx="118" cy="81" r="5" fill="#0c4a6e"/>
  <circle cx="80" cy="79" r="2" fill="#fff" opacity="0.5"/>
  <circle cx="116" cy="79" r="2" fill="#fff" opacity="0.5"/>
  <path d="M80 110 L85 120 L90 110 L95 120 L100 110 L105 120 L110 110 L115 120 L120 110" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
  <polygon points="55,100 35,110 50,105" fill="url(#fmGrad)" stroke="#0284c7" stroke-width="1"/>
  <polygon points="145,100 165,110 150,105" fill="url(#fmGrad)" stroke="#0284c7" stroke-width="1"/>
  <circle cx="68" cy="130" r="3" fill="#e0f2fe" opacity="0.4" filter="url(#fmGlow)"/>
  <circle cx="132" cy="130" r="3" fill="#e0f2fe" opacity="0.4" filter="url(#fmGlow)"/>
</svg>
`)}`;

// ─── Shadow ──────────────────────────────────────────────────

export const DUSKTALON_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="dtGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="50%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </radialGradient>
    <filter id="dtBlur">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="178" rx="35" ry="8" fill="#3b076444" filter="url(#dtBlur)"/>
  <path d="M100,30 Q130,40 140,75 Q148,110 135,145 Q120,170 100,175 Q80,170 65,145 Q52,110 60,75 Q70,40 100,30" fill="url(#dtGlow)" stroke="#3b0764" stroke-width="1.5" filter="url(#dtBlur)"/>
  <path d="M60,55 Q35,25 52,60" fill="#7c3aed" stroke="#3b0764" stroke-width="1"/>
  <path d="M140,55 Q165,25 148,60" fill="#7c3aed" stroke="#3b0764" stroke-width="1"/>
  <path d="M52,80 Q30,70 35,90 Q25,95 45,100" fill="#7c3aed88" opacity="0.6"/>
  <path d="M148,80 Q170,70 165,90 Q175,95 155,100" fill="#7c3aed88" opacity="0.6"/>
  <circle cx="82" cy="85" r="10" fill="#f9a8d4" opacity="0.9"/>
  <circle cx="118" cy="85" r="10" fill="#f9a8d4" opacity="0.9"/>
  <circle cx="82" cy="86" r="5" fill="#3b0764"/>
  <circle cx="118" cy="86" r="5" fill="#3b0764"/>
  <path d="M90 120 Q100 128 110 120" stroke="#a78bfa" stroke-width="2" fill="none"/>
  <path d="M75,140 Q60,160 70,155" stroke="#7c3aed44" stroke-width="3" fill="none"/>
  <path d="M125,140 Q140,160 130,155" stroke="#7c3aed44" stroke-width="3" fill="none"/>
  <circle cx="65" cy="120" r="3" fill="#a78bfa" opacity="0.3" filter="url(#dtBlur)"/>
  <circle cx="135" cy="120" r="3" fill="#a78bfa" opacity="0.3" filter="url(#dtBlur)"/>
</svg>
`)}`;

export const TERRAVEX_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="rockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b8860b"/>
      <stop offset="50%" stop-color="#8B6914"/>
      <stop offset="100%" stop-color="#654a0e"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="175" rx="55" ry="10" fill="#33220088"/>
  <polygon points="100,25 155,75 165,140 140,170 60,170 35,140 45,75" fill="url(#rockGrad)" stroke="#654a0e" stroke-width="2"/>
  <polygon points="70,65 100,40 130,65 120,60 100,48 80,60" fill="#c49a3088"/>
  <rect x="75" y="95" width="15" height="10" rx="2" fill="#2a1a00" opacity="0.8"/>
  <rect x="110" y="95" width="15" height="10" rx="2" fill="#2a1a00" opacity="0.8"/>
  <line x1="80" y1="125" x2="120" y2="125" stroke="#2a1a00" stroke-width="3" stroke-linecap="round"/>
  <polygon points="55,110 35,130 50,125" fill="url(#rockGrad)" stroke="#654a0e" stroke-width="1"/>
  <polygon points="145,110 165,130 150,125" fill="url(#rockGrad)" stroke="#654a0e" stroke-width="1"/>
</svg>
`)}`;

export const UMBRAVEIL_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="shadowGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="60%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#2e1065"/>
    </radialGradient>
    <filter id="shadowBlur">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="175" rx="40" ry="12" fill="#2e106588" filter="url(#shadowBlur)"/>
  <path d="M100,20 Q145,30 150,80 Q155,130 130,160 Q100,180 70,160 Q45,130 50,80 Q55,30 100,20" fill="url(#shadowGlow)" filter="url(#shadowBlur)"/>
  <path d="M55,55 Q40,30 50,60" stroke="#7c3aed" stroke-width="2" fill="#7c3aed"/>
  <path d="M145,55 Q160,30 150,60" stroke="#7c3aed" stroke-width="2" fill="#7c3aed"/>
  <circle cx="80" cy="85" r="10" fill="#f9a8d4" opacity="0.9"/>
  <circle cx="120" cy="85" r="10" fill="#f9a8d4" opacity="0.9"/>
  <circle cx="80" cy="86" r="5" fill="#4c1d95"/>
  <circle cx="120" cy="86" r="5" fill="#4c1d95"/>
  <path d="M85 115 Q100 125 115 115" stroke="#c084fc" stroke-width="2" fill="none"/>
  <path d="M65,150 Q55,170 70,165" fill="#7c3aed44"/>
  <path d="M135,150 Q145,170 130,165" fill="#7c3aed44"/>
</svg>
`)}`;

// ─── Wind ────────────────────────────────────────────────────

export const ZEPHYRION_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0"/>
      <stop offset="50%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#34d399"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="35" ry="6" fill="#34d39944"/>
  <path d="M100,25 Q130,40 135,70 Q140,100 130,130 Q120,155 100,165 Q80,155 70,130 Q60,100 65,70 Q70,40 100,25" fill="url(#windGrad)" stroke="#34d399" stroke-width="1.5"/>
  <path d="M65,70 Q40,55 50,80" fill="url(#windGrad)" stroke="#34d399" stroke-width="1"/>
  <path d="M135,70 Q160,55 150,80" fill="url(#windGrad)" stroke="#34d399" stroke-width="1"/>
  <path d="M50,80 Q30,90 45,100" fill="url(#windGrad)" stroke="#34d399" stroke-width="1"/>
  <path d="M150,80 Q170,90 155,100" fill="url(#windGrad)" stroke="#34d399" stroke-width="1"/>
  <circle cx="85" cy="80" r="7" fill="#fff" opacity="0.9"/>
  <circle cx="115" cy="80" r="7" fill="#fff" opacity="0.9"/>
  <circle cx="85" cy="81" r="3.5" fill="#064e3b"/>
  <circle cx="115" cy="81" r="3.5" fill="#064e3b"/>
  <path d="M90 105 Q100 112 110 105" stroke="#064e3b" stroke-width="1.5" fill="none"/>
  <path d="M40,60 Q25,50 30,65" stroke="#6ee7b788" stroke-width="2" fill="none"/>
  <path d="M160,60 Q175,50 170,65" stroke="#6ee7b788" stroke-width="2" fill="none"/>
  <path d="M45,120 Q30,125 40,135" stroke="#6ee7b788" stroke-width="2" fill="none"/>
  <path d="M155,120 Q170,125 160,135" stroke="#6ee7b788" stroke-width="2" fill="none"/>
</svg>
`)}`;

export const AEROVEX_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="stormGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="175" rx="30" ry="6" fill="#05966944"/>
  <polygon points="100,20 140,65 165,90 155,95 130,85 120,110 110,160 90,160 80,110 70,85 45,95 35,90 60,65" fill="url(#stormGrad)" stroke="#059669" stroke-width="1.5"/>
  <polygon points="100,20 115,50 100,40 85,50" fill="#a7f3d088"/>
  <circle cx="88" cy="75" r="6" fill="#fff" opacity="0.9"/>
  <circle cx="112" cy="75" r="6" fill="#fff" opacity="0.9"/>
  <circle cx="88" cy="76" r="3" fill="#064e3b"/>
  <circle cx="112" cy="76" r="3" fill="#064e3b"/>
  <path d="M92 95 L100 102 L108 95" fill="#059669" stroke="#064e3b" stroke-width="1"/>
  <line x1="80" y1="130" x2="85" y2="150" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
  <line x1="120" y1="130" x2="115" y2="150" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
</svg>
`)}`;

// ─── Nature ──────────────────────────────────────────────────

export const THORNBLOOM_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#166534"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="45" ry="8" fill="#16653444"/>
  <ellipse cx="100" cy="110" rx="45" ry="55" fill="url(#leafGlow)" stroke="#166534" stroke-width="1.5"/>
  <path d="M70,30 Q80,55 85,65" stroke="#22c55e" stroke-width="3" fill="none"/>
  <path d="M130,30 Q120,55 115,65" stroke="#22c55e" stroke-width="3" fill="none"/>
  <ellipse cx="68" cy="25" rx="10" ry="6" fill="#4ade80" transform="rotate(-20,68,25)"/>
  <ellipse cx="132" cy="25" rx="10" ry="6" fill="#4ade80" transform="rotate(20,132,25)"/>
  <path d="M55,90 Q40,85 42,95" fill="#22c55e"/>
  <path d="M145,90 Q160,85 158,95" fill="#22c55e"/>
  <path d="M55,130 Q38,135 45,142" fill="#22c55e"/>
  <path d="M145,130 Q162,135 155,142" fill="#22c55e"/>
  <circle cx="85" cy="100" r="7" fill="#fff" opacity="0.9"/>
  <circle cx="115" cy="100" r="7" fill="#fff" opacity="0.9"/>
  <circle cx="85" cy="101" r="3.5" fill="#052e16"/>
  <circle cx="115" cy="101" r="3.5" fill="#052e16"/>
  <path d="M90 125 Q100 133 110 125" stroke="#052e16" stroke-width="1.5" fill="none"/>
  <circle cx="75" cy="75" r="5" fill="#f472b6" opacity="0.7"/>
  <circle cx="125" cy="75" r="5" fill="#f472b6" opacity="0.7"/>
  <circle cx="100" cy="60" r="4" fill="#fbbf24" opacity="0.6"/>
</svg>
`)}`;

export const SYLVURSA_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="mossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="50" ry="10" fill="#15803d44"/>
  <ellipse cx="100" cy="105" rx="55" ry="65" fill="url(#mossGrad)" stroke="#15803d" stroke-width="2"/>
  <ellipse cx="65" cy="48" rx="18" ry="14" fill="url(#mossGrad)" stroke="#15803d" stroke-width="1.5"/>
  <ellipse cx="135" cy="48" rx="18" ry="14" fill="url(#mossGrad)" stroke="#15803d" stroke-width="1.5"/>
  <circle cx="82" cy="90" r="9" fill="#fff" opacity="0.9"/>
  <circle cx="118" cy="90" r="9" fill="#fff" opacity="0.9"/>
  <circle cx="82" cy="91" r="4.5" fill="#052e16"/>
  <circle cx="118" cy="91" r="4.5" fill="#052e16"/>
  <ellipse cx="100" cy="115" rx="12" ry="6" fill="#052e16" opacity="0.6"/>
  <path d="M60,60 Q50,50 55,65" fill="#4ade8088"/>
  <path d="M140,60 Q150,50 145,65" fill="#4ade8088"/>
  <rect x="75" y="155" width="15" height="20" rx="5" fill="#15803d"/>
  <rect x="110" y="155" width="15" height="20" rx="5" fill="#15803d"/>
  <circle cx="70" cy="75" r="3" fill="#86efac" opacity="0.5"/>
  <circle cx="130" cy="75" r="3" fill="#86efac" opacity="0.5"/>
  <circle cx="100" cy="55" r="3" fill="#86efac" opacity="0.5"/>
</svg>
`)}`;

// ─── Psychic ─────────────────────────────────────────────────

export const MENTALIS_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="psiGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#f9a8d4"/>
      <stop offset="60%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#9d174d"/>
    </radialGradient>
    <filter id="psiBlur">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="178" rx="30" ry="8" fill="#9d174d44"/>
  <polygon points="100,15 130,55 145,100 135,145 110,170 90,170 65,145 55,100 70,55" fill="url(#psiGlow)" stroke="#9d174d" stroke-width="1" filter="url(#psiBlur)"/>
  <polygon points="100,15 115,40 100,30 85,40" fill="#fce7f388"/>
  <circle cx="85" cy="85" r="10" fill="#fff" opacity="0.95"/>
  <circle cx="115" cy="85" r="10" fill="#fff" opacity="0.95"/>
  <circle cx="85" cy="86" r="5" fill="#701a75"/>
  <circle cx="115" cy="86" r="5" fill="#701a75"/>
  <circle cx="85" cy="84" r="2" fill="#fff" opacity="0.6"/>
  <circle cx="115" cy="84" r="2" fill="#fff" opacity="0.6"/>
  <path d="M90 115 Q100 120 110 115" stroke="#9d174d" stroke-width="1.5" fill="none"/>
  <circle cx="100" cy="30" r="8" fill="#f9a8d4" opacity="0.4" filter="url(#psiBlur)"/>
  <circle cx="60" cy="70" r="4" fill="#f9a8d4" opacity="0.3"/>
  <circle cx="140" cy="70" r="4" fill="#f9a8d4" opacity="0.3"/>
  <circle cx="55" cy="120" r="3" fill="#f9a8d4" opacity="0.2"/>
  <circle cx="145" cy="120" r="3" fill="#f9a8d4" opacity="0.2"/>
</svg>
`)}`;

export const CEREBRYX_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="brainGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#fbcfe8"/>
      <stop offset="50%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#be185d"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="35" ry="7" fill="#be185d44"/>
  <ellipse cx="100" cy="70" rx="50" ry="45" fill="url(#brainGlow)" stroke="#be185d" stroke-width="1.5"/>
  <path d="M100,28 Q95,50 100,70 Q105,50 100,28" stroke="#be185d88" stroke-width="1" fill="none"/>
  <path d="M65,40 Q80,55 70,75" stroke="#be185d88" stroke-width="1" fill="none"/>
  <path d="M135,40 Q120,55 130,75" stroke="#be185d88" stroke-width="1" fill="none"/>
  <rect x="85" y="115" width="30" height="50" rx="8" fill="#f472b6" stroke="#be185d" stroke-width="1"/>
  <circle cx="88" cy="80" r="6" fill="#fff" opacity="0.9"/>
  <circle cx="112" cy="80" r="6" fill="#fff" opacity="0.9"/>
  <circle cx="88" cy="81" r="3" fill="#701a75"/>
  <circle cx="112" cy="81" r="3" fill="#701a75"/>
  <path d="M94 98 Q100 103 106 98" stroke="#be185d" stroke-width="1.5" fill="none"/>
  <line x1="90" y1="130" x2="75" y2="150" stroke="#f472b6" stroke-width="4" stroke-linecap="round"/>
  <line x1="110" y1="130" x2="125" y2="150" stroke="#f472b6" stroke-width="4" stroke-linecap="round"/>
  <circle cx="100" cy="20" r="5" fill="#fbcfe8" opacity="0.5"/>
</svg>
`)}`;

// ─── Metal ───────────────────────────────────────────────────

export const FERROCLAW_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="40%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="50" ry="8" fill="#47556944"/>
  <polygon points="100,20 145,55 160,110 145,160 55,160 40,110 55,55" fill="url(#metalGrad)" stroke="#475569" stroke-width="2"/>
  <polygon points="100,20 120,42 100,32 80,42" fill="#e2e8f088"/>
  <rect x="75" y="75" width="16" height="12" rx="3" fill="#1e293b" opacity="0.9"/>
  <rect x="109" y="75" width="16" height="12" rx="3" fill="#1e293b" opacity="0.9"/>
  <circle cx="81" cy="80" r="3" fill="#f44" opacity="0.8"/>
  <circle cx="115" cy="80" r="3" fill="#f44" opacity="0.8"/>
  <line x1="82" y1="105" x2="118" y2="105" stroke="#1e293b" stroke-width="2"/>
  <line x1="85" y1="110" x2="90" y2="105" stroke="#1e293b" stroke-width="1.5"/>
  <line x1="100" y1="110" x2="100" y2="105" stroke="#1e293b" stroke-width="1.5"/>
  <line x1="115" y1="110" x2="110" y2="105" stroke="#1e293b" stroke-width="1.5"/>
  <polygon points="40,90 20,105 35,100" fill="url(#metalGrad)" stroke="#475569" stroke-width="1"/>
  <polygon points="160,90 180,105 165,100" fill="url(#metalGrad)" stroke="#475569" stroke-width="1"/>
  <polygon points="25,105 15,115 20,108" fill="#94a3b8"/>
  <polygon points="175,105 185,115 180,108" fill="#94a3b8"/>
  <polygon points="20,115 10,125 18,118" fill="#94a3b8"/>
  <polygon points="180,115 190,125 182,118" fill="#94a3b8"/>
</svg>
`)}`;

export const TITANOX_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="180" rx="55" ry="10" fill="#33415544"/>
  <rect x="50" y="35" width="100" height="100" rx="18" fill="url(#steelGrad)" stroke="#334155" stroke-width="2"/>
  <rect x="70" y="135" width="20" height="40" rx="5" fill="#64748b" stroke="#334155" stroke-width="1"/>
  <rect x="110" y="135" width="20" height="40" rx="5" fill="#64748b" stroke="#334155" stroke-width="1"/>
  <rect x="30" y="60" width="20" height="50" rx="8" fill="#64748b" stroke="#334155" stroke-width="1"/>
  <rect x="150" y="60" width="20" height="50" rx="8" fill="#64748b" stroke="#334155" stroke-width="1"/>
  <circle cx="80" cy="75" r="10" fill="#1e293b"/>
  <circle cx="120" cy="75" r="10" fill="#1e293b"/>
  <circle cx="80" cy="74" r="5" fill="#38bdf8" opacity="0.9"/>
  <circle cx="120" cy="74" r="5" fill="#38bdf8" opacity="0.9"/>
  <rect x="78" y="100" width="44" height="8" rx="3" fill="#1e293b"/>
  <line x1="85" y1="100" x2="85" y2="108" stroke="#64748b" stroke-width="1.5"/>
  <line x1="95" y1="100" x2="95" y2="108" stroke="#64748b" stroke-width="1.5"/>
  <line x1="105" y1="100" x2="105" y2="108" stroke="#64748b" stroke-width="1.5"/>
  <line x1="115" y1="100" x2="115" y2="108" stroke="#64748b" stroke-width="1.5"/>
  <rect x="85" y="30" width="10" height="12" rx="3" fill="#94a3b8"/>
  <rect x="105" y="30" width="10" height="12" rx="3" fill="#94a3b8"/>
</svg>
`)}`;

// ─── Light ───────────────────────────────────────────────────

export const SOLARIUS_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="sunGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="40%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </radialGradient>
    <filter id="sunBlur">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="178" rx="35" ry="7" fill="#d9770644"/>
  <circle cx="100" cy="85" r="45" fill="url(#sunGlow)" stroke="#d97706" stroke-width="1.5" filter="url(#sunBlur)"/>
  <polygon points="100,20 105,38 110,20 100,30" fill="#fbbf24"/>
  <polygon points="100,150 105,132 110,150 100,140" fill="#fbbf24"/>
  <polygon points="35,85 53,80 35,75 45,85" fill="#fbbf24"/>
  <polygon points="165,85 147,80 165,75 155,85" fill="#fbbf24"/>
  <polygon points="55,40 68,50 50,50 60,45" fill="#fbbf24"/>
  <polygon points="145,40 132,50 150,50 140,45" fill="#fbbf24"/>
  <polygon points="55,130 68,120 50,120 60,125" fill="#fbbf24"/>
  <polygon points="145,130 132,120 150,120 140,125" fill="#fbbf24"/>
  <circle cx="85" cy="78" r="7" fill="#fff" opacity="0.95"/>
  <circle cx="115" cy="78" r="7" fill="#fff" opacity="0.95"/>
  <circle cx="85" cy="79" r="3.5" fill="#92400e"/>
  <circle cx="115" cy="79" r="3.5" fill="#92400e"/>
  <path d="M88 100 Q100 110 112 100" stroke="#92400e" stroke-width="2" fill="none"/>
  <path d="M80,145 Q90,165 100,170 Q110,165 120,145" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
</svg>
`)}`;

export const LUXFAWN_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="deerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="50%" stop-color="#fcd34d"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="deerGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="180" rx="30" ry="5" fill="#f59e0b44"/>
  <ellipse cx="100" cy="80" rx="25" ry="22" fill="url(#deerGrad)" stroke="#f59e0b" stroke-width="1.5"/>
  <path d="M80,62 L72,30 L78,42 L70,20 L80,44" stroke="#fcd34d" stroke-width="2" fill="none" filter="url(#deerGlow)"/>
  <path d="M120,62 L128,30 L122,42 L130,20 L120,44" stroke="#fcd34d" stroke-width="2" fill="none" filter="url(#deerGlow)"/>
  <circle cx="90" cy="78" r="5" fill="#fff" opacity="0.95"/>
  <circle cx="110" cy="78" r="5" fill="#fff" opacity="0.95"/>
  <circle cx="90" cy="79" r="2.5" fill="#78350f"/>
  <circle cx="110" cy="79" r="2.5" fill="#78350f"/>
  <ellipse cx="100" cy="90" rx="4" ry="2.5" fill="#78350f" opacity="0.5"/>
  <ellipse cx="100" cy="125" rx="30" ry="40" fill="url(#deerGrad)" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="82" y1="155" x2="78" y2="178" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <line x1="118" y1="155" x2="122" y2="178" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <line x1="90" y1="160" x2="88" y2="178" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <line x1="110" y1="160" x2="112" y2="178" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <circle cx="100" cy="115" r="6" fill="#fef3c7" opacity="0.4" filter="url(#deerGlow)"/>
</svg>
`)}`;

// ─── Toxic ───────────────────────────────────────────────────

export const VENOMIRE_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="acidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a3e635"/>
      <stop offset="50%" stop-color="#84cc16"/>
      <stop offset="100%" stop-color="#4d7c0f"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="40" ry="8" fill="#4d7c0f44"/>
  <path d="M100,25 Q140,40 145,80 Q148,110 135,140 Q125,160 115,170 Q105,175 95,175 Q85,170 75,155 Q60,130 55,100 Q52,70 60,50 Q70,35 100,25" fill="url(#acidGrad)" stroke="#4d7c0f" stroke-width="1.5"/>
  <circle cx="82" cy="75" r="9" fill="#fff" opacity="0.9"/>
  <circle cx="118" cy="80" r="7" fill="#fff" opacity="0.9"/>
  <circle cx="82" cy="76" r="5" fill="#1a2e05"/>
  <circle cx="118" cy="81" r="3.5" fill="#1a2e05"/>
  <path d="M85 105 Q100 118 115 108" stroke="#1a2e05" stroke-width="2" fill="none"/>
  <path d="M90 110 L95 118" stroke="#a3e635" stroke-width="1.5" fill="none"/>
  <path d="M108 110 L103 118" stroke="#a3e635" stroke-width="1.5" fill="none"/>
  <circle cx="65" cy="110" r="4" fill="#a3e63588" opacity="0.6"/>
  <circle cx="140" cy="100" r="3" fill="#a3e63588" opacity="0.6"/>
  <circle cx="55" cy="95" r="2.5" fill="#a3e63588" opacity="0.4"/>
  <circle cx="70" cy="135" r="5" fill="#a3e63544" opacity="0.5"/>
  <circle cx="130" cy="130" r="4" fill="#a3e63544" opacity="0.4"/>
</svg>
`)}`;

export const BLIGHTWING_SPRITE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="toxGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#d9f99d"/>
      <stop offset="60%" stop-color="#84cc16"/>
      <stop offset="100%" stop-color="#365314"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="175" rx="25" ry="5" fill="#36531444"/>
  <ellipse cx="100" cy="100" rx="22" ry="30" fill="url(#toxGlow)" stroke="#365314" stroke-width="1.5"/>
  <path d="M78,85 Q40,50 25,80 Q20,100 40,105 Q55,108 78,100" fill="#84cc16" stroke="#365314" stroke-width="1" opacity="0.8"/>
  <path d="M122,85 Q160,50 175,80 Q180,100 160,105 Q145,108 122,100" fill="#84cc16" stroke="#365314" stroke-width="1" opacity="0.8"/>
  <circle cx="50" cy="80" r="3" fill="#d9f99d" opacity="0.5"/>
  <circle cx="35" cy="90" r="2" fill="#d9f99d" opacity="0.4"/>
  <circle cx="150" cy="80" r="3" fill="#d9f99d" opacity="0.5"/>
  <circle cx="165" cy="90" r="2" fill="#d9f99d" opacity="0.4"/>
  <circle cx="92" cy="92" r="5" fill="#fff" opacity="0.9"/>
  <circle cx="108" cy="92" r="5" fill="#fff" opacity="0.9"/>
  <circle cx="92" cy="93" r="2.5" fill="#1a2e05"/>
  <circle cx="108" cy="93" r="2.5" fill="#1a2e05"/>
  <path d="M95 110 Q100 115 105 110" stroke="#365314" stroke-width="1" fill="none"/>
  <path d="M100,130 Q95,145 90,165" stroke="#365314" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M100,130 Q105,145 110,165" stroke="#365314" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M92,135 Q80,130 75,140" stroke="#84cc16" stroke-width="2" fill="none" opacity="0.6"/>
  <path d="M108,135 Q120,130 125,140" stroke="#84cc16" stroke-width="2" fill="none" opacity="0.6"/>
</svg>
`)}`;
