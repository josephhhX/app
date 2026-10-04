import React from 'react';

export function JamiLogo({ className = "w-8 h-8", textSize = "text-xl", showText = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`${className} rounded-[11px] bg-gradient-to-br from-[#1b4942] to-[#143d36] flex items-center justify-center p-1 shadow-sm shrink-0`}>
        <svg viewBox="0 0 512 512" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cat Silhouette */}
          <g fill="#ffffff">
            <path d="M145 230 L165 115 C170 102 188 108 205 130 L238 185 Z" />
            <path d="M367 230 L347 115 C342 102 324 108 307 130 L274 185 Z" />
            <ellipse cx="256" cy="290" rx="150" ry="120" />
          </g>
          {/* Inner Ears */}
          <path d="M172 205 L180 145 L215 195 Z" fill="#1b4942" opacity="0.25" />
          <path d="M340 205 L332 145 L297 195 Z" fill="#1b4942" opacity="0.25" />
          {/* Eyes */}
          <ellipse cx="205" cy="275" rx="13" ry="17" fill="#1b4942" />
          <ellipse cx="307" cy="275" rx="13" ry="17" fill="#1b4942" />
          <circle cx="209" cy="271" r="5" fill="#ffffff" />
          <circle cx="311" cy="271" r="5" fill="#ffffff" />
          {/* Nose */}
          <polygon points="256,298 248,309 264,309" fill="#1b4942" />
          {/* Mouth */}
          <path d="M246 314 Q256 322 266 314" stroke="#1b4942" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Whiskers */}
          <path d="M165 292 Q130 286 112 284" stroke="#1b4942" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.75" />
          <path d="M165 308 Q130 309 110 312" stroke="#1b4942" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.75" />
          <path d="M347 292 Q382 286 400 284" stroke="#1b4942" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.75" />
          <path d="M347 308 Q382 309 402 312" stroke="#1b4942" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.75" />
        </svg>
      </div>

      {showText && (
        <span className={`font-black tracking-tight text-[#163a34] dark:text-[#e4eee9] ${textSize}`}>
          Jami
        </span>
      )}
    </div>
  );
}
