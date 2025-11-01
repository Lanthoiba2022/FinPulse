import React from "react";

interface LoadingSkeletonProps {
  rows: number;
  cols: number;
}

export default function LoadingSkeleton({ rows, cols }: LoadingSkeletonProps) {
  const r = Math.max(1, rows);
  const c = Math.max(1, cols);
  return (
    <tbody>
      {Array.from({ length: r }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: c }).map((__, j) => (
            <td key={j} className="p-3">
              <div className="h-4 w-full rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}


