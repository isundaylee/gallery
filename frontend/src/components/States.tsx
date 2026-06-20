// Consistent loading and empty states, so pages no longer flash blank.
export function Loading() {
  return (
    <div className="flex justify-center py-20">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center text-gray-500">{message}</div>
  )
}
