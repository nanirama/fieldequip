// Shown immediately while the page's async data (Sanity) is loading.
// Matches the hero gradient so there is no flash of white before content paints.
export default function Loading() {
  return (
    <div
      className="min-h-dvh w-full bg-[linear-gradient(180deg,#162A4A_0%,#3C5B8D_40%,#6f8fc4_55%,#ffffff_70%)]"
      aria-hidden="true"
    />
  );
}
