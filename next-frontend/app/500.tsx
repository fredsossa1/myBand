import ErrorPage from "@/components/error-page";

export default function Error500() {
  return (
    <ErrorPage
      error="Something went wrong on our end! Our servers are having a moment."
      showRetry={true}
      onRetry={() => window.location.reload()}
    />
  );
}