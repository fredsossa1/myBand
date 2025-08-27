"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-white/20 border-t-white/80",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingCardProps {
  title?: string;
  message?: string;
  className?: string;
}

export function LoadingCard({
  title = "Loading...",
  message,
  className,
}: LoadingCardProps) {
  return (
    <div className={cn("glass rounded-xl p-8 text-center fade-in", className)}>
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          {message && <p className="text-white/60 text-sm mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

export function LoadingState({ rows = 3, className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass rounded-lg p-4">
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/20 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("glass rounded-xl p-8 text-center fade-in", className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">❌</div>
        <div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="text-red-300 text-sm mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title = "No data found",
  message,
  icon = "📭",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("glass rounded-xl p-8 text-center fade-in", className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="text-white/60 text-sm mt-1">{message}</p>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
