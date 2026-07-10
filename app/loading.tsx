// Shown immediately while the page's async data (Sanity) is loading.
// Matches the hero gradient so there is no flash of white before content paints.
export default function Loading() {
  return (
    <div
      className="min-h-dvh w-full"
      aria-hidden="true"
    />
  );
}
