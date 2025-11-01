"use client";
import React from "react";

interface WarningBannerProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function WarningBanner({ visible, message, onClose }: WarningBannerProps) {
  if (!visible) return null;
  return (
    <div className="mb-4 rounded border-l-4 border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-100/10 dark:text-yellow-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span role="img" aria-label="warning">⚠️</span>
          <span>{message}</span>
        </div>
        <button onClick={onClose} className="rounded px-2 py-1 text-xs text-yellow-800 hover:bg-yellow-100 dark:text-yellow-200 dark:hover:bg-yellow-900/30">×</button>
      </div>
    </div>
  );
}


