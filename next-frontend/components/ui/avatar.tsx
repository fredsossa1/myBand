import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  className = "",
  ...props
}: AvatarProps) {
  return (
    <div
      className={`relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-medium text-white ${className}`}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback || (alt ? alt.charAt(0).toUpperCase() : "?")}</span>
      )}
    </div>
  );
}
