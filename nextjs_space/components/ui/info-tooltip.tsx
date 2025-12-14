
"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  children: React.ReactNode
  content: string
  side?: "top" | "right" | "bottom" | "left"
  delayDuration?: number
}

export function InfoTooltip({ 
  children, 
  content, 
  side = "top",
  delayDuration = 500 
}: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-[280px] bg-champion-charcoal text-white border-champion-green/20 shadow-lg animate-slide-up-fade"
        >
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
