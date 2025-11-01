import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-4 w-24 rounded bg-gray-200 mb-2" />
            <div className="h-8 w-36 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="h-6 w-48 rounded bg-gray-200 mb-6" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="h-[220px] w-[220px] rounded-full bg-gray-200" />
            <div className="flex-1 w-full space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full rounded-full bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-6 w-36 rounded bg-gray-200 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-3">
                <div className="col-span-4 h-4 rounded bg-gray-200" />
                <div className="col-span-6 h-4 rounded bg-gray-200" />
                <div className="col-span-2 h-4 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((groupIndex) => (
          <div key={groupIndex} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="h-6 w-32 rounded bg-gray-200" />
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {[1, 2].map((rowIndex) => (
                  <div key={rowIndex} className="border-b border-gray-200 p-4">
                    <div className="grid grid-cols-7 gap-4">
                      <div className="col-span-2 h-4 rounded bg-gray-200" />
                      <div className="h-4 rounded bg-gray-200" />
                      <div className="h-4 rounded bg-gray-200" />
                      <div className="h-4 rounded bg-gray-200" />
                      <div className="h-4 rounded bg-gray-200" />
                      <div className="h-4 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


