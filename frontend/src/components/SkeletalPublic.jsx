import React from "react";

const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-lg ${className}`}
  />
);

const SkeletalPublic = () => {
  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* ================= LEFT PROFILE PANEL ================= */}
      <div className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-xl" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>

        {/* My Creations */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* ================= CENTER SECTION ================= */}
      <div className="space-y-6">
        
        {/* Stats Circle + Difficulty */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <div className="flex gap-6">
            <Skeleton className="w-40 h-40 rounded-full" />
            <div className="flex flex-col justify-center gap-4 flex-1">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Contest Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
          <Skeleton className="h-6 w-48" />

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>

        {/* Language Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-4">
          <Skeleton className="h-6 w-40" />

          <div className="flex gap-4">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      {/* ================= RIGHT TOPIC PANEL ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-5">
        
        {/* Tabs */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Topic List */}
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletalPublic;
