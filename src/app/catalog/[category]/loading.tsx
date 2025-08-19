export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-[#660000] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading category...</p>
      </div>
    </div>
  );
}
