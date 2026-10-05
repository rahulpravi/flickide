"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = "",
  showGlow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-lg overflow-hidden select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle outer neon glow effect */}
      {showGlow && (
        <div
          className="absolute inset-0 bg-[#0070f3] blur-md opacity-40 rounded-lg pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Official FlickIDE Brand Logo Image */}
      <img
        src="/logo.png"
        alt="FlickIDE Logo"
        width={size}
        height={size}
        className="relative z-10 w-full h-full object-contain rounded-lg"
      />
    </div>
  );
};

export const LogoVector: React.FC<LogoProps> = ({
  size = 32,
  className = "",
  showGlow = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Background card with subtle rounded corners */}
      <rect width="100" height="100" rx="16" fill="#090d13" />

      {/* Radial ambient glow behind F symbol */}
      {showGlow && (
        <circle cx="50" cy="50" r="38" fill="#0070f3" opacity="0.22" filter="blur(14px)" />
      )}

      {/* Main F Letter & Chevron in Electric Cyan/Blue */}
      <g fill="#007bff">
        {/* Left vertical stem & top bar & middle arm */}
        <path d="M 27 18.5 H 73.5 V 30.5 H 40 V 47 H 49.5 V 58 H 40 V 81.5 H 27 V 18.5 Z" />

        {/* Chevron > nested within F */}
        <path d="M 49.5 35 L 73.5 49 V 56 L 49.5 70 V 61.5 L 64.5 52.5 L 49.5 43.5 Z" />
      </g>
    </svg>
  );
};
