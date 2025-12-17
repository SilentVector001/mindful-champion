
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  User, Mail, MapPin, Calendar, Trophy, Target, Award,
  Clock, TrendingUp, Video, BookOpen, Brain
} from "lucide-react"

export default function UserOverview({ data }: { data: any }) {
  const { user, analytics, achievements, goals, matches } = data

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Profile Information */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="text-lg text-slate-900">
                  {user.name || `${user.firstName} ${user.lastName}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-lg text-slate-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Skill Level</label>
                <p className="text-lg text-slate-900">{user.skillLevel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Player Rating</label>
                <p className="text-lg text-slate-900">{user.playerRating}</p>
              </div>
              {user.ageRange && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Age Range</label>
                  <p className="text-lg text-slate-900">{user.ageRange}</p>
                </div>
              )}
              {user.gender && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Gender</label>
                  <p className="text-lg text-slate-900">{user.gender}</p>
                </div>
              )}
              {user.location && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Location</label>
                  <p className="text-lg text-slate-900">{user.location}</p>
                </div>
              )}
              {user.playingFrequency && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Playing Frequency</label>
                  <p className="text-lg text-slate-900">{user.playingFrequency}</p>
                </div>
              )}
            </div>

            {user.primaryGoals && Array.isArray(user.primaryGoals) && user.primaryGoals.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">Primary Goals</label>
                <div className="flex flex-wrap gap-2">
                  {user.primaryGoals.map((goal: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{goal}</Badge>
                  ))}
                </div>
              </div>
            )}

            {user.biggestChallenges && Array.isArray(user.biggestChallenges) && user.biggestChallenges.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">Biggest Challenges</label>
                <div className="flex flex-wrap gap-2">
                  {user.biggestChallenges.map((challenge: string, idx: number) => (
                    <Badge key={idx} variant="outline">{challenge}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Joined:</span>{' '}
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-600">Last Active:</span>{' '}
                  <span className="font-medium">
                    {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Onboarding:</span>{' '}
                  <Badge variant={user.onboardingCompleted ? "default" : "secondary"}>
                    {user.onboardingCompleted ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-600">Account Status:</span>{' '}
                  <Badge variant={user.accountLocked ? "destructive" : "default"}>
                    {user.accountLocked ? 'Locked' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{analytics.videoStats.totalWatched}</div>
                <div className="text-sm text-slate-600">Videos Completed</div>
                <div className="text-xs text-slate-500 mt-1">
                  {analytics.videoStats.totalStarted} started
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{analytics.drillStats.completed}</div>
                <div className="text-sm text-slate-600">Drills Completed</div>
                <div className="text-xs text-slate-500 mt-1">
                  {analytics.drillStats.inProgress} in progress
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{user._count.matches}</div>
                <div className="text-sm text-slate-600">Total Matches</div>
                <div className="text-xs text-slate-500 mt-1">
                  {user.totalWins} wins
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Page Views</span>
                  <span className="font-medium">{analytics.totalPageViews}</span>
                </div>
                <Progress value={Math.min((analytics.totalPageViews / 1000) * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Avg Session Duration</span>
                  <span className="font-medium">{Math.round(analytics.avgSessionTime / 60)} minutes</span>
                </div>
                <Progress value={Math.min((analytics.avgSessionTime / 3600) * 100, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Recent Achievements */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-sm text-slate-600">No achievements yet</p>
            ) : (
              <div className="space-y-3">
                {achievements.slice(0, 5).map((ach: any) => (
                  <div key={ach.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 truncate">
                        {ach.achievement.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {new Date(ach.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-sm text-slate-600">No active goals</p>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 5).map((goal: any) => (
                  <div key={goal.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium text-sm text-slate-900 mb-2">
                      {goal.title}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span>{goal.progress}% Complete</span>
                      <Badge variant={goal.completed ? "default" : "secondary"} className="text-xs">
                        {goal.completed ? 'Done' : 'In Progress'}
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <p className="text-sm text-slate-600">No matches played</p>
            ) : (
              <div className="space-y-2">
                {matches.slice(0, 5).map((match: any) => (
                  <div key={match.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        vs {match.opponent}
                      </div>
                      <div className="text-xs text-slate-600">
                        {new Date(match.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={match.result === 'WIN' ? "default" : "secondary"} className="text-xs">
                      {match.result}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
