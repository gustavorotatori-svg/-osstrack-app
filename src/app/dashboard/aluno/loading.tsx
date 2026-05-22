import { DashboardSkeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="max-w-lg mx-auto w-full px-4 py-4">
      <DashboardSkeleton />
    </div>
  )
}
