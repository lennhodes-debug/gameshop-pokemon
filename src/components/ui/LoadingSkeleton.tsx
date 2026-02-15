'use client';

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'image' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
  aspectRatio?: 'square' | '16/9' | '4/3';
}

export default function LoadingSkeleton({
  variant = 'card',
  width = 'w-full',
  height = 'h-10',
  count = 1,
  className,
  aspectRatio = 'square',
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse';

  const aspectRatioClasses = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
  };

  const skeletonVariants = {
    card: (
      <div className={cn('space-y-3 p-4', className)}>
        <div className={cn(baseClasses, 'h-40 w-full', aspectRatioClasses[aspectRatio])} />
        <div className={cn(baseClasses, 'h-4 w-3/4')} />
        <div className={cn(baseClasses, 'h-4 w-1/2')} />
        <div className={cn(baseClasses, 'h-6 w-1/4')} />
      </div>
    ),
    text: (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              i === count - 1 ? 'w-2/3' : 'w-full',
              height
            )}
          />
        ))}
      </div>
    ),
    image: (
      <div
        className={cn(
          baseClasses,
          width,
          height,
          aspectRatioClasses[aspectRatio],
          className
        )}
      />
    ),
    circle: (
      <div
        className={cn(
          baseClasses,
          'rounded-full',
          width,
          height,
          className
        )}
      />
    ),
    rectangle: (
      <div
        className={cn(
          baseClasses,
          width,
          height,
          className
        )}
      />
    ),
  };

  return skeletonVariants[variant];
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0">
      <LoadingSkeleton variant="image" className="w-full h-64" aspectRatio="square" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton variant="text" height="h-4" count={2} />
        <LoadingSkeleton variant="rectangle" width="w-1/3" height="h-5" />
        <LoadingSkeleton variant="rectangle" width="w-full" height="h-10" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <LoadingSkeleton variant="image" width="w-full" height="h-96" aspectRatio="square" />
      </div>
      <div className="space-y-6">
        <LoadingSkeleton variant="text" height="h-8" count={2} />
        <LoadingSkeleton variant="rectangle" width="w-1/4" height="h-6" />
        <LoadingSkeleton variant="text" height="h-4" count={3} />
        <div className="space-y-2">
          <LoadingSkeleton variant="rectangle" width="w-1/3" height="h-5" />
          <LoadingSkeleton variant="rectangle" width="w-1/2" height="h-4" />
        </div>
        <LoadingSkeleton variant="rectangle" width="w-full" height="h-12" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <LoadingSkeleton variant="rectangle" width="w-1/2" height="h-4" />
            <LoadingSkeleton variant="rectangle" width="w-2/3" height="h-6" className="mt-2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    </div>
  );
}
