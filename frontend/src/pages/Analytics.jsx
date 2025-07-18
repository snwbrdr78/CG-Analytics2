import { useState } from 'react'
import { useQuery } from 'react-query'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCurrency, formatViews, formatCompactNumber } from '../utils/formatters'

export default function Analytics() {
  usePageTitle('Analytics')
  const [period, setPeriod] = useState('month')

  const { data: topPosts } = useQuery(
    ['analytics-top-posts', period],
    () => api.get(`/analytics/top-posts?period=${period}&limit=10`).then(res => res.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: () => {}
    }
  )

  const { data: underperforming } = useQuery(
    'analytics-underperforming',
    () => api.get('/analytics/underperforming').then(res => res.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: () => {}
    }
  )

  const { data: timeline } = useQuery(
    ['analytics-timeline', period],
    () => api.get('/analytics/earnings-timeline').then(res => res.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: () => {}
    }
  )

  const formatCPM = (earnings, views) => {
    if (!views || views === 0) return formatCurrency(0)
    return formatCurrency((earnings / views) * 1000)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>

      {/* Period Selector */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="mt-1 block w-32 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      {/* Earnings Timeline */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Earnings Timeline</h2>
        {timeline && timeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'Views' ? formatCompactNumber(value) : formatCurrency(value),
                  name
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.95)',
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: '#f3f4f6'
                }}
              />
              <Line type="monotone" dataKey="totalEarnings" stroke="#4F46E5" name="Earnings" />
              <Line type="monotone" dataKey="totalViews" stroke="#10B981" name="Views" yAxisId="right" />
              <YAxis yAxisId="right" orientation="right" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
            <p>No timeline data available. Upload multiple CSV files over time to see trends.</p>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Performing Posts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Top Performing Posts
            </h3>
            <div className="flow-root">
              {topPosts && topPosts.length > 0 ? (
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {topPosts.map((item, idx) => (
                    <li key={`${item.post.postId}-${idx}`} className="py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors rounded-md px-2 -mx-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500">
                            <span className="text-sm font-medium leading-none text-white">
                              {idx + 1}
                            </span>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.post.title || 'Untitled'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.post.postType} • {item.post.Artist?.name || 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(item.metrics.earnings || 0)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatViews(item.metrics.views || 0)} views
                            </p>
                          </div>
                          {item.post.permalink && (
                            <a
                              href={item.post.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="View on Facebook"
                            >
                              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No posts data available. Upload CSV files to see top performing content.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Underperforming Posts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Lowest Earning Videos
            </h3>
            <div className="flow-root">
              {underperforming && underperforming.length > 0 ? (
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {underperforming.map((post, index) => (
                    <li key={`${post.postId}-underperform-${index}`} className="py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors rounded-md px-2 -mx-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {post.title || 'Untitled'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {post.artist_name || 'Unassigned'} • {formatViews(post.lifetimeQualifiedViews || 0)} views
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(post.lifetimeEarnings || 0)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCPM(post.lifetimeEarnings, post.lifetimeQualifiedViews)} CPM
                            </p>
                          </div>
                          {post.permalink && (
                            <a
                              href={post.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="View on Facebook"
                            >
                              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No underperforming posts found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Artist Performance */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Performance by Artist
          </h3>
          {timeline && timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#f3f4f6'
                  }}
                />
                {Object.keys(timeline[0]?.byArtist || {}).map((artist, idx) => (
                  <Bar 
                    key={artist}
                    dataKey={`byArtist.${artist}.earnings`}
                    name={artist}
                    fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444'][idx % 4]}
                    stackId="a"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              <p>No artist performance data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}