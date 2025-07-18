import { useState } from 'react'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { MagnifyingGlassIcon, FilmIcon, PhotoIcon, PencilIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'
import EditPostModal from '../components/EditPostModal'

export default function Posts() {
  const [filters, setFilters] = useState({
    status: 'all',
    type: '',
    search: ''
  })
  const [page, setPage] = useState(0)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const limit = 20

  const { data: posts, isLoading } = useQuery(
    ['posts', filters, page],
    () => api.get('/posts', {
      params: {
        ...filters,
        limit,
        offset: page * limit
      }
    }).then(res => res.data)
  )

  const { data: artists } = useQuery('artists',
    () => api.get('/artists').then(res => res.data)
  )

  const getIcon = (postType) => {
    if (postType === 'Video' || postType === 'Videos') return FilmIcon
    if (postType === 'Photo') return PhotoIcon
    return FilmIcon
  }

  const formatCPM = (earnings, views) => {
    if (!views || views === 0) return '-'
    return `$${((earnings / views) * 1000).toFixed(2)}`
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Posts</h1>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="live">Live</option>
            <option value="removed">Removed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="Video">Video</option>
            <option value="Reel">Reel</option>
            <option value="Photo">Photo</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by title or asset tag..."
            />
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts?.posts?.map((post) => {
                    const Icon = getIcon(post.postType)
                    const latestSnapshot = post.Snapshots?.[0]
                    
                    return (
                      <tr key={post.postId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {post.title || 'Untitled'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {post.assetTag && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {post.assetTag}
                                  </span>
                                )}
                                <span className="ml-2 text-xs">
                                  {post.postType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.Artist?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(post.publishTime), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${latestSnapshot?.lifetimeEarnings ? Number(latestSnapshot.lifetimeEarnings).toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {latestSnapshot?.lifetimeQualifiedViews?.toLocaleString() || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCPM(
                            latestSnapshot?.lifetimeEarnings,
                            latestSnapshot?.lifetimeQualifiedViews
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            post.status === 'live' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedPost(post)
                              setIsEditModalOpen(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {page * limit + 1} to {Math.min((page + 1) * limit, posts?.total || 0)} of{' '}
          {posts?.total || 0} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!posts || (page + 1) * limit >= posts.total}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      
      <EditPostModal 
        post={selectedPost}
        isOpen={isEditModalOpen}
        onClose={() => {
          setSelectedPost(null)
          setIsEditModalOpen(false)
        }}
      />
    </div>
  )
}