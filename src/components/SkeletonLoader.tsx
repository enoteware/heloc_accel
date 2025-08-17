import React from "react";

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
}

export default function SkeletonLoader({
  className = "",
  lines = 3,
  height = "h-4",
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-muted rounded ${height} ${
            index === lines - 1 ? "" : "mb-3"
          } ${index === lines - 1 ? "w-3/4" : "w-full"}`}
        ></div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-card rounded-lg shadow-md p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-4/6"></div>
        </div>
        <div className="mt-6 flex space-x-2">
          <div className="h-8 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-card rounded-lg shadow-md p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-card rounded-lg shadow-md overflow-hidden ${className}`}
    >
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-card px-6 py-3 border-b border-border">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        {/* Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
