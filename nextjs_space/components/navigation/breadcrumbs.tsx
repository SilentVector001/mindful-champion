"use client"

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Mapping of routes to their breadcrumb labels
const routeLabels: Record<string, string> = {
  "/dashboard": "My Progress",
  "/media": "Live Tournaments",
  "/media/streaming": "Streaming",
  "/media/podcasts": "Podcasts",
  "/train": "Train",
  "/train/coach": "Coach Kai",
  "/train/video": "Video Analysis",
  "/train/drills": "Drill Library",
  "/train/library": "Video Library",
  "/progress": "Progress",
  "/progress/goals": "Goals",
  "/progress/matches": "Match History",
  "/progress/achievements": "Achievements",
  "/connect": "Connect",
  "/connect/tournaments": "Tournaments",
  "/coaches": "Expert Coaches",
  "/marketplace": "Rewards Store",
  "/profile": "Profile",
  "/settings": "Settings"
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()

  // If custom items are provided, use those
  if (items) {
    return (
      <nav className={cn("flex items-center space-x-1 text-sm", className)} aria-label="Breadcrumb">
        <Link
          href="/dashboard"
          className="flex items-center text-gray-500 hover:text-champion-green transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only">Home</span>
        </Link>
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-900">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-champion-green transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    )
  }

  // Auto-generate breadcrumbs from pathname
  const pathSegments = pathname?.split("/").filter(Boolean) || []
  
  // Don't show breadcrumbs for root or dashboard only
  if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === "dashboard")) {
    return null
  }

  // Build breadcrumb trail
  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ""

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    breadcrumbs.push({
      label,
      href: currentPath
    })
  })

  return (
    <nav className={cn("flex items-center space-x-1 text-sm mb-4", className)} aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex items-center text-gray-500 hover:text-champion-green transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">My Progress</span>
      </Link>
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-gray-900">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-champion-green transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
