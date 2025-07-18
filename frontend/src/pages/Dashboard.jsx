import { useQuery } from 'react-query'
import {
  CurrencyDollarIcon,
  EyeIcon,
  FilmIcon,
  ChartBarIcon,
  ArrowArrowTrendingUpIcon,
  ArrowArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import { 
  formatCurrency, 
  formatSmartCurrency, 
  formatNumber, 
  formatViews,
  formatCompactNumber,
  formatPercentage
} from '../utils/formatters'

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, isCurrency = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
            {entry.name}: {isCurrency ? formatCurrency(entry.value) : formatNumber(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { data: dashboard, isLoading } = useQuery('dashboard', 
    () => api.get('/analytics/dashboard').then(res => res.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: () => {}
    }
  )

  const { data: timeline } = useQuery('earnings-timeline',
    () => api.get('/analytics/earnings-timeline').then(res => res.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: () => {}
    }
  )

  const { data: topPosts } = useQuery('top-posts',
    () => api.get('/analytics/top-posts?limit=5').then(res => res.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: () => {}
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading dashboard...
        </div>
      </div>
    )
  }

  // Calculate percentage changes
  const earningsChange = dashboard?.lifetime?.total_earnings && dashboard?.lastMonth?.earnings
    ? ((dashboard.thisMonth?.earnings - dashboard.lastMonth.earnings) / dashboard.lastMonth.earnings) * 100
    : 0

  const viewsChange = dashboard?.lifetime?.total_views && dashboard?.lastMonth?.views
    ? ((dashboard.thisMonth?.views - dashboard.lastMonth.views) / dashboard.lastMonth.views) * 100
    : 0

  const stats = [
    {
      name: 'Total Revenue',
      value: formatSmartCurrency(dashboard?.lifetime?.total_earnings || 0),
      fullValue: formatCurrency(dashboard?.lifetime?.total_earnings || 0),
      icon: CurrencyDollarIcon,
      change: earningsChange,
      changeValue: formatCurrency(dashboard?.thisMonth?.earnings || 0),
      changeLabel: 'this month',
      color: 'indigo'
    },
    {
      name: 'Total Views',
      value: formatCompactNumber(dashboard?.lifetime?.total_views || 0),
      fullValue: formatNumber(dashboard?.lifetime?.total_views || 0),
      icon: EyeIcon,
      change: viewsChange,
      changeValue: formatViews(dashboard?.thisMonth?.views || 0),
      changeLabel: 'this month',
      color: 'blue'
    },
    {
      name: 'Active Content',
      value: formatNumber(dashboard?.statusBreakdown?.find(s => s.status === 'live')?.count || 0),
      fullValue: null,
      icon: FilmIcon,
      change: null,
      changeValue: formatNumber(dashboard?.statusBreakdown?.find(s => s.status === 'removed')?.count || 0),
      changeLabel: 'removed',
      color: 'green'
    },
    {
      name: 'Avg. CPM',
      value: dashboard?.lifetime?.total_views > 0 
        ? formatCurrency((dashboard.lifetime.total_earnings / dashboard.lifetime.total_views) * 1000)
        : '$0.00',
      fullValue: null,
      icon: ChartBarIcon,
      change: null,
      changeValue: null,
      changeLabel: 'Per 1,000 views',
      color: 'purple'
    }
  ]

  const colorClasses = {
    indigo: 'bg-indigo-500 dark:bg-indigo-600',
    blue: 'bg-blue-500 dark:bg-blue-600',
    green: 'bg-green-500 dark:bg-green-600',
    purple: 'bg-purple-500 dark:bg-purple-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your content monetization overview
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="relative bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-lg ${colorClasses[stat.color]} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      {stat.fullValue && stat.fullValue !== stat.value && (
                        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({stat.fullValue})
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                {stat.change !== null ? (
                  <div className="flex items-center text-sm">
                    {stat.change > 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : stat.change < 0 ? (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    ) : null}
                    <span className={`font-medium ${
                      stat.change > 0 ? 'text-green-600 dark:text-green-400' : 
                      stat.change < 0 ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {stat.change !== 0 && formatPercentage(Math.abs(stat.change))}
                    </span>
                    {stat.changeValue && (
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {stat.changeValue} {stat.changeLabel}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.changeValue && (
                      <>
                        <span className="font-medium">{stat.changeValue}</span>{' '}
                      </>
                    )}
                    {stat.changeLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Earnings Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h3>
          {timeline && timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="period" 
                  className="text-xs"
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => formatSmartCurrency(value, true)}
                />
                <Tooltip content={<CustomTooltip isCurrency={true} />} />
                <Line 
                  type="monotone" 
                  dataKey="totalEarnings" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366F1', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No revenue data available yet.<br />
                Upload CSV files to see trends over time.
              </p>
            </div>
          )}
        </div>

        {/* Content Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Distribution
          </h3>
          {dashboard?.typeBreakdown && dashboard.typeBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.typeBreakdown} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="postType" 
                  className="text-xs"
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#10B981" 
                  radius={[8, 8, 0, 0]}
                  name="Posts"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No content data available yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Content
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              By total revenue
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CPM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topPosts && topPosts.length > 0 ? (
                topPosts.map((item, index) => {
                  const cpm = item.metrics.views > 0 
                    ? (item.metrics.earnings / item.metrics.views) * 1000 
                    : 0
                  return (
                    <tr key={`${item.post.postId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="max-w-xs truncate font-medium">
                          {item.post.title || 'Untitled'}
                        </div>
                        {item.post.assetTag && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.post.assetTag}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.post.postType === 'Video' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          item.post.postType === 'Reel' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {item.post.postType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.metrics.earnings || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatViews(item.metrics.views || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(cpm)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <FilmIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p>No content data available yet.</p>
                      <p className="mt-1">Upload CSV files to see your top performing content.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}