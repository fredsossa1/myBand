"use client";

import ErrorPage from "@/components/error-page";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorPage
          error={error}
          onRetry={reset}
          showRetry={true}
        />
      </body>
    </html>
  );
}