"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam or misleading" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "OTHER", label: "Other" }
]

interface ReportModalProps {
  onSubmit: (reason: string) => void
  onClose: () => void
}

export function ReportModal({ onSubmit, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<string>("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Report Content</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-400 text-sm">Why are you reporting this post?</p>
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={r.value} className="border-slate-600" />
                <Label htmlFor={r.value} className="text-slate-300 cursor-pointer">{r.label}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(reason)}
              disabled={!reason}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
