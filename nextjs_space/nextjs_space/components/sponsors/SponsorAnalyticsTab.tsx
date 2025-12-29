'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function SponsorAnalyticsTab({ analytics }: { analytics: any }) {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={analytics.overview.totalViews.toLocaleString()}
          subtitle="Impressions"
          icon={Eye}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Total Clicks"
          value={analytics.overview.totalClicks.toLocaleString()}
          subtitle="Engagements"
          icon={MousePointer}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Redemptions"
          value={analytics.overview.totalRedemptions.toLocaleString()}
          subtitle={`${analytics.overview.avgConversionRate}% conversion`}
          icon={ShoppingCart}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Total Value"
          value={`$${analytics.overview.totalValue.toLocaleString()}`}
          subtitle="Revenue generated"
          icon={DollarSign}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Recent Redemptions */}
      {analytics.redemptions?.recent?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Redemptions</CardTitle>
            <CardDescription>Latest redemptions from users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.redemptions.recent.map((redemption: any) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{redemption.offer?.title}</p>
                    <p className="text-sm text-gray-600">
                      {redemption.user?.firstName} {redemption.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${getStatusColor(redemption.status)} text-white mb-1`}
                    >
                      {redemption.status}
                    </Badge>
                    <p className="text-xs text-gray-600">
                      {format(new Date(redemption.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offer Performance */}
      {analytics.offers?.performance?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Offer Performance</CardTitle>
            <CardDescription>Detailed performance metrics for each offer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.offers.performance.map((offer: any) => (
                <div
                  key={offer.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{offer.title}</h4>
                      <Badge variant="outline">{offer.status}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${offer.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{offer.views}</p>
                      <p className="text-xs text-gray-600">Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{offer.clicks}</p>
                      <p className="text-xs text-gray-600">Clicks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{offer.redemptions}</p>
                      <p className="text-xs text-gray-600">Redeemed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{offer.conversionRate}%</p>
                      <p className="text-xs text-gray-600">Conversion</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Points Cost:</span>{' '}
                      <span className="font-semibold">{offer.pointsCost}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Retail Value:</span>{' '}
                      <span className="font-semibold">${offer.retailValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Redemptions by Status */}
      {analytics.redemptions?.byStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Redemptions by Status</CardTitle>
            <CardDescription>Current status of all redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatusCard
                label="Pending"
                count={analytics.redemptions.byStatus.pending}
                color="bg-yellow-500"
              />
              <StatusCard
                label="Processing"
                count={analytics.redemptions.byStatus.processing}
                color="bg-blue-500"
              />
              <StatusCard
                label="Shipped"
                count={analytics.redemptions.byStatus.shipped}
                color="bg-purple-500"
              />
              <StatusCard
                label="Delivered"
                count={analytics.redemptions.byStatus.delivered}
                color="bg-green-500"
              />
              <StatusCard
                label="Cancelled"
                count={analytics.redemptions.byStatus.cancelled}
                color="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color, bgColor }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="text-center p-4 rounded-lg bg-gray-50">
      <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
      <p className="text-2xl font-bold mb-1">{count}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    PROCESSING: 'bg-blue-500',
    SHIPPED: 'bg-purple-500',
    DELIVERED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}
