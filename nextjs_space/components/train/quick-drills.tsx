
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Clock, Target, Play, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const quickDrills = [
  {
    id: 1,
    name: "5-Minute Serve Warmup",
    duration: "5 min",
    focus: "Serving",
    description: "Quick serve practice to build consistency",
    steps: [
      "10 serves to deuce side",
      "10 serves to ad side", 
      "Focus on depth and placement"
    ]
  },
  {
    id: 2,
    name: "Dinking Sprint",
    duration: "10 min",
    focus: "Dinking",
    description: "Rapid-fire dinking to improve touch and control",
    steps: [
      "Partner at kitchen line",
      "Rally for 20 consecutive dinks",
      "Vary pace and spin",
      "Repeat 5 times"
    ]
  },
  {
    id: 3,
    name: "Volley Blast",
    duration: "7 min",
    focus: "Net Play",
    description: "High-intensity volleys to sharpen reflexes",
    steps: [
      "Both players at kitchen",
      "Fast-paced volleys for 1 minute",
      "30 second break",
      "Repeat 5 times"
    ]
  },
  {
    id: 4,
    name: "Third Shot Focus",
    duration: "10 min",
    focus: "Third Shot",
    description: "Concentrated third shot drop practice",
    steps: [
      "Start at baseline",
      "Partner at kitchen feeds",
      "Execute 15 third shot drops",
      "Switch roles"
    ]
  },
  {
    id: 5,
    name: "Footwork Drill",
    duration: "5 min",
    focus: "Movement",
    description: "Quick footwork patterns and split-steps",
    steps: [
      "Baseline to kitchen line",
      "Practice split-steps",
      "Side-to-side shuffles",
      "Repeat pattern 10 times"
    ]
  },
  {
    id: 6,
    name: "Power Practice",
    duration: "10 min",
    focus: "Power Shots",
    description: "Build power in drives and slams",
    steps: [
      "Partner feeds high balls",
      "Execute overhead slams",
      "Baseline drives",
      "Focus on technique over power"
    ]
  }
]

export default function QuickDrills() {
  const [activeDrill, setActiveDrill] = useState<number | null>(null)
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set())

  const toggleDrillCompletion = (id: number) => {
    setCompletedDrills(prev => {
      const updated = new Set(prev)
      if (updated.has(id)) {
        updated.delete(id)
      } else {
        updated.add(id)
      }
      return updated
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-900">Quick Drills</h1>
          </div>
          <p className="text-slate-600">Short, focused drills for when you're pressed for time</p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Today's Quick Session</h3>
                <p className="text-sm text-slate-600">
                  Complete {completedDrills.size} of {quickDrills.length} drills
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-600">
                  {completedDrills.size}/{quickDrills.length}
                </div>
                <p className="text-xs text-slate-600">drills done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {quickDrills.map(drill => {
            const isCompleted = completedDrills.has(drill.id)
            const isActive = activeDrill === drill.id

            return (
              <Card
                key={drill.id}
                className={cn(
                  "transition-all",
                  isCompleted && "bg-green-50 border-green-200",
                  isActive && "ring-2 ring-teal-500"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Zap className="h-5 w-5 text-teal-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {drill.focus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="h-3 w-3" />
                      {drill.duration}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{drill.name}</CardTitle>
                  <CardDescription>{drill.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isActive && (
                    <div className="mb-4 space-y-2 border-t pt-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-teal-600" />
                        Steps
                      </h4>
                      <ul className="space-y-1.5">
                        {drill.steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-teal-600 font-semibold min-w-[20px]">{idx + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setActiveDrill(isActive ? null : drill.id)}
                    >
                      {isActive ? "Hide" : "View"} Steps
                    </Button>
                    <Button
                      size="sm"
                      className={cn(
                        "flex-1",
                        isCompleted
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                      )}
                      onClick={() => toggleDrillCompletion(drill.id)}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Done
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-6 bg-teal-50 border-teal-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-3">Quick Drill Tips:</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                Perfect for warmups before matches or practice
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                Focus on quality over quantity in each repetition
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                Can be done solo or with a practice partner
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                Combine multiple drills for a complete 30-minute session
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
