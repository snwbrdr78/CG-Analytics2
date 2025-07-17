import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { ArchiveBoxXMarkIcon, FilmIcon, PhotoIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'

export default function RemovedContent() {
  const { data: removedPosts, isLoading } = useQuery('removed-posts', 
    () => api.get('/posts/status/removed').then(res => res.data)
  )

  const { data: report } = useQuery('removed-report',
    () => api.get('/reports/removed-content').then(res => res.data)
  )

  if (isLoading) return <div>Loading...</div>

  const getIcon = (postType) => {
    if (postType === 'Video' || postType === 'Videos') return FilmIcon
    if (postType === 'Photo') return PhotoIcon
    return ArchiveBoxXMarkIcon
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Removed Content</h1>
          <p className="mt-2 text-sm text-gray-700">
            Content ready for re-editing and re-posting
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100">
            {report?.totalRemoved || 0} posts removed
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FilmIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Videos
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {removedPosts?.filter(p => 
                        p.postType === 'Video' || p.postType === 'Videos'
                      ).length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhotoIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reels
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {removedPosts?.filter(p => p.postType === 'Reel').length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArchiveBoxXMarkIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Lifetime Earnings
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      ${removedPosts?.reduce((sum, p) => 
                        sum + (p.Snapshots?.[0]?.lifetimeEarnings || 0), 0
                      ).toFixed(2) || '0.00'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Removed Posts List */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {removedPosts?.map((post) => {
            const latestSnapshot = post.Snapshots?.[0]
            const Icon = getIcon(post.postType)
            
            return (
              <li key={post.postId}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {post.title || 'Untitled'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.assetTag && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {post.assetTag}
                            </span>
                          )}
                          <span className="ml-2">
                            {post.Artist?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${latestSnapshot?.lifetimeEarnings?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {latestSnapshot?.lifetimeQualifiedViews?.toLocaleString() || '0'} views
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          Removed {format(new Date(post.removedDate), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Posted {format(new Date(post.publishTime), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show associated reels warning */}
                  {post.ReelLinks?.length > 0 && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                      <p className="text-xs text-yellow-800">
                        ⚠️ This video has {post.ReelLinks.length} associated reels
                      </p>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}