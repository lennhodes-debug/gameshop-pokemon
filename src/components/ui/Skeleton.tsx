import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'image' | 'card' | 'button' | 'badge';
}

export default function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 rounded',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'image' && 'h-52 w-full rounded-t-2xl',
        variant === 'card' && 'h-80 w-full rounded-2xl',
        variant === 'button' && 'h-9 w-24 rounded-xl',
        variant === 'badge' && 'h-5 w-16 rounded-full',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
      <Skeleton variant="image" />
      <div className="p-4 space-y-3">
        <div className="flex gap-1.5">
          <Skeleton variant="badge" />
          <Skeleton variant="badge" className="w-12" />
        </div>
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Skeleton variant="text" className="w-16 h-6" />
          <Skeleton variant="button" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton variant="text" className="w-64 h-3 mb-8" />
      <div className="grid lg:grid-cols-2 gap-12">
        <Skeleton variant="image" className="h-96 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton variant="badge" className="w-24" />
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton variant="text" className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" className="w-5/6" />
            <Skeleton variant="text" className="w-4/6" />
          </div>
          <Skeleton variant="button" className="w-full h-12" />
        </div>
      </div>
    </div>
  );
}

export function ShopGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
