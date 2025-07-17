import { useQuery } from 'react-query'
import {
  CurrencyDollarIcon,
  EyeIcon,
  FilmIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'

export default function Dashboard() {
  const { data: dashboard, isLoading } = useQuery('dashboard', 
    () => api.get('/analytics/dashboard').then(res => res.data)
  )

  const { data: timeline } = useQuery('earnings-timeline',
    () => api.get('/analytics/earnings-timeline').then(res => res.data)
  )

  const { data: topPosts } = useQuery('top-posts',
    () => api.get('/analytics/top-posts?limit=5').then(res => res.data)
  )

  if (isLoading) return <div>Loading...</div>

  const stats = [
    {
      name: 'Total Earnings',
      value: `$${dashboard?.lifetime?.total_earnings?.toFixed(2) || '0.00'}`,
      icon: CurrencyDollarIcon,
      change: `$${dashboard?.thisMonth?.earnings?.toFixed(2) || '0.00'} this month`
    },
    {
      name: 'Total Views',
      value: (dashboard?.lifetime?.total_views || 0).toLocaleString(),
      icon: EyeIcon,
      change: `${(dashboard?.thisMonth?.views || 0).toLocaleString()} this month`
    },
    {
      name: 'Total Posts',
      value: dashboard?.lifetime?.total_posts || 0,
      icon: FilmIcon,
      change: `${dashboard?.statusBreakdown?.find(s => s.status === 'removed')?.count || 0} removed`
    },
    {
      name: 'Average CPM',
      value: dashboard?.lifetime?.total_views > 0 
        ? `$${((dashboard.lifetime.total_earnings / dashboard.lifetime.total_views) * 1000).toFixed(2)}`
        : '$0.00',
      icon: ChartBarIcon,
      change: 'Per 1,000 views'
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats */}
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Earnings Timeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings Over Time</h3>
          {timeline && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="totalEarnings" stroke="#4F46E5" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Post Type Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Breakdown</h3>
          {dashboard?.typeBreakdown && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.typeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="postType" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Posts */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Top Performing Posts
          </h3>
          <div className="mt-5">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPosts?.map((item) => (
                    <tr key={item.post.postId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.post.title || 'Untitled'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.post.postType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.metrics.earnings?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.metrics.views?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}