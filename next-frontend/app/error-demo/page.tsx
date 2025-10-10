import ErrorPage from "@/components/error-page";

export default function ErrorDemo() {
  return (
    <ErrorPage
      error="This is a demo of our fun error page! Nothing is actually broken - we're just showing off our biblical humor."
      showRetry={true}
    />
  );
}
