"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Pause, 
  StopCircle, 
  RefreshCw,
  Crown,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  History,
  Sparkles,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function UserSubscription({ data, onRefresh }: { data: any, onRefresh: () => void }) {
  const { user, subscriptions, payments } = data
  const [loading, setLoading] = useState(false)
  const [showAdvancedForm, setShowAdvancedForm] = useState(false)
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Advanced form state
  const [formData, setFormData] = useState({
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    billingCycle: 'MONTHLY',
    expirationDate: '',
    reason: ''
  })

  // Extend trial state
  const [extendDays, setExtendDays] = useState(7)
  const [extendReason, setExtendReason] = useState('')

  const currentSub = subscriptions[0]

  // Load subscription history
  useEffect(() => {
    loadHistory()
  }, [user.id])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription/history`)
      if (response.ok) {
        const result = await response.json()
        setHistory(result.data || [])
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSubscriptionAction = async (action: string, subscriptionId: string) => {
    const reason = prompt(`Enter reason for ${action}:`)
    if (!reason) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, subscriptionId, reason })
      })

      if (response.ok) {
        toast.success(`Successfully ${action}ed subscription`)
        onRefresh()
        loadHistory()
      } else {
        const error = await response.json()
        toast.error(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Subscription action error:', error)
      toast.error('Failed to perform action')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickUpgrade = async (tier: string) => {
    const reason = prompt(`Enter reason for upgrading to ${tier}:`)
    if (!reason) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription/manual-upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tier, 
          status: 'ACTIVE',
          billingCycle: 'MANUAL',
          reason 
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.data.message)
        onRefresh()
        loadHistory()
      } else {
        const error = await response.json()
        toast.error(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Quick upgrade error:', error)
      toast.error('Failed to upgrade')
    } finally {
      setLoading(false)
    }
  }

  const handleExtendTrial = async () => {
    if (!extendReason.trim()) {
      toast.error('Please enter a reason')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription/extend-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: extendDays, reason: extendReason })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.data.message)
        setShowExtendDialog(false)
        setExtendReason('')
        onRefresh()
        loadHistory()
      } else {
        const error = await response.json()
        toast.error(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Extend trial error:', error)
      toast.error('Failed to extend trial')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantLifetime = async (tier: string) => {
    const reason = prompt(`Enter reason for granting lifetime ${tier} access:`)
    if (!reason) return

    const confirmed = confirm(`Are you sure you want to grant LIFETIME ${tier} access? This cannot be easily undone.`)
    if (!confirmed) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription/grant-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, reason })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.data.message)
        onRefresh()
        loadHistory()
      } else {
        const error = await response.json()
        toast.error(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Grant lifetime error:', error)
      toast.error('Failed to grant access')
    } finally {
      setLoading(false)
    }
  }

  const handleAdvancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.reason.trim()) {
      toast.error('Please enter a reason for this change')
      return
    }

    const confirmed = confirm(`Are you sure you want to change subscription to ${formData.tier} (${formData.status})?`)
    if (!confirmed) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription/manual-upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.data.message)
        setShowAdvancedForm(false)
        setFormData({ ...formData, reason: '' })
        onRefresh()
        loadHistory()
      } else {
        const error = await response.json()
        toast.error(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Advanced form error:', error)
      toast.error('Failed to update subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Instantly manage user subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Button
              onClick={() => handleQuickUpgrade('PRO')}
              disabled={loading || user.subscriptionTier === 'PRO'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Upgrade to PRO
            </Button>
            <Button
              onClick={() => handleQuickUpgrade('PREMIUM')}
              disabled={loading || user.subscriptionTier === 'PREMIUM'}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to PREMIUM
            </Button>
            <Button
              onClick={() => handleQuickUpgrade('FREE')}
              disabled={loading || user.subscriptionTier === 'FREE'}
              variant="outline"
              className="w-full"
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              Downgrade to FREE
            </Button>
            <Button
              onClick={() => setShowExtendDialog(true)}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Clock className="w-4 h-4 mr-2" />
              Extend Trial
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Button
              onClick={() => handleGrantLifetime('PREMIUM')}
              disabled={loading}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Grant Lifetime PREMIUM
            </Button>
            <Button
              onClick={() => setShowAdvancedForm(true)}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Advanced Options
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Subscription and Payment History */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentSub ? (
              <div className="space-y-4">
                <p className="text-slate-600">No subscription record found</p>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 font-medium">User Tier</span>
                    <Badge className={
                      user.subscriptionTier === 'PRO' ? 'bg-purple-500' :
                      user.subscriptionTier === 'PREMIUM' ? 'bg-orange-500' :
                      'bg-slate-500'
                    }>
                      {user.subscriptionTier}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Status</span>
                    <Badge variant={user.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                      {user.subscriptionStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tier</span>
                  <Badge className={
                    currentSub.tier === 'PRO' ? 'bg-purple-500' :
                    currentSub.tier === 'PREMIUM' ? 'bg-orange-500' :
                    'bg-slate-500'
                  }>
                    {currentSub.tier}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status</span>
                  <Badge variant={currentSub.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {currentSub.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Billing Cycle</span>
                  <span className="font-medium">{currentSub.billingCycle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-medium">
                    {currentSub.amount === 0 ? 'Complimentary' : `$${(currentSub.amount / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Period Start</span>
                  <span className="font-medium">
                    {new Date(currentSub.currentPeriodStart).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Period End</span>
                  <span className="font-medium">
                    {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                {currentSub.stripeSubscriptionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Stripe ID</span>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {currentSub.stripeSubscriptionId}
                    </code>
                  </div>
                )}

                {currentSub.status === 'ACTIVE' && currentSub.stripeSubscriptionId && (
                  <div className="pt-4 border-t space-y-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={loading}
                      onClick={() => handleSubscriptionAction('pause', currentSub.stripeSubscriptionId)}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Subscription
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={loading}
                      onClick={() => handleSubscriptionAction('cancel', currentSub.stripeSubscriptionId)}
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      disabled={loading}
                      onClick={() => handleSubscriptionAction('refund', currentSub.stripeSubscriptionId)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Issue Refund
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-slate-600">No payments yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">
                        ${(payment.amount / 100).toFixed(2)}
                      </span>
                      <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      {payment.subscriptionTier} - {payment.billingCycle}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(payment.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Subscription Change History
          </CardTitle>
          <CardDescription>
            All manual changes made by administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No subscription changes yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((item: any) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-slate-900">
                        {item.action?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {item.oldValues && item.newValues && (
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Previous:</p>
                        <Badge variant="outline" className="mr-2">
                          {item.oldValues.tier || 'N/A'}
                        </Badge>
                        {item.oldValues.status && (
                          <Badge variant="secondary">
                            {item.oldValues.status}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">New:</p>
                        <Badge variant="outline" className="mr-2">
                          {item.newValues.tier || 'N/A'}
                        </Badge>
                        {item.newValues.status && (
                          <Badge variant="default">
                            {item.newValues.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Reason:</span> {item.reason}
                    </p>
                    {item.performedByUser && (
                      <p className="text-xs text-slate-500 mt-1">
                        By: {item.performedByUser.email || item.performedByUser.firstName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extend Trial Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial Period</DialogTitle>
            <DialogDescription>
              Add additional days to the user's trial period
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Days to Add</Label>
              <Select value={extendDays.toString()} onValueChange={(v) => setExtendDays(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason (Required)</Label>
              <Textarea
                placeholder="Enter reason for extending trial..."
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExtendTrial} disabled={loading || !extendReason.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Extend Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Form Dialog */}
      <Dialog open={showAdvancedForm} onOpenChange={setShowAdvancedForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Advanced Subscription Management</DialogTitle>
            <DialogDescription>
              Full control over subscription settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdvancedSubmit} className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Subscription Tier</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({...formData, tier: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE</SelectItem>
                    <SelectItem value="PRO">PRO</SelectItem>
                    <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="TRIAL">TRIAL</SelectItem>
                    <SelectItem value="CANCELED">CANCELED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Billing Cycle</Label>
                <Select value={formData.billingCycle} onValueChange={(v) => setFormData({...formData, billingCycle: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                    <SelectItem value="YEARLY">YEARLY</SelectItem>
                    <SelectItem value="LIFETIME">LIFETIME</SelectItem>
                    <SelectItem value="MANUAL">MANUAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Reason for Change (Required)</Label>
              <Textarea
                placeholder="Explain why this subscription change is being made..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdvancedForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.reason.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Apply Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
