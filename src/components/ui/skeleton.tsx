import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// Stat Card Skeleton - matches the 4 stat cards at top
function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border py-6 px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

// Chit Card Skeleton - matches the chit fund cards
function ChitCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
      {/* Header: Name + Badge */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Progress section */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* Participants / Commission row */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

// Page Header Skeleton
function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  );
}

// Table Skeleton
function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </div>
    </div>
  );
}

// Chart Skeleton
function ChartSkeleton() {
  const heights = [40, 60, 35, 80, 55, 70, 45, 65];
  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm">
      <div className="mb-4">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {heights.map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

// Profile Dialog Skeleton
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
      <ChartSkeleton />
    </div>
  );
}

// Deprecated alias for backward compatibility
const CardSkeleton = ChitCardSkeleton;

export {
  Skeleton,
  StatCardSkeleton,
  ChitCardSkeleton,
  CardSkeleton,
  TableRowSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
  ChartSkeleton,
  ProfileSkeleton,
};
