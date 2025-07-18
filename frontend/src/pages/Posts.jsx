import { useState } from 'react'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { MagnifyingGlassIcon, FilmIcon, PhotoIcon, PencilIcon, ChevronUpIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon, LinkIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'
import EditPostModal from '../components/EditPostModal'
import LinkToVideoModal from '../components/LinkToVideoModal'
import ViewLinkedReelsModal from '../components/ViewLinkedReelsModal'

export default function Posts() {
  const [filters, setFilters] = useState({
    status: 'all',
    type: '',
    search: ''
  })
  const [page, setPage] = useState(0)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLinkToVideoModalOpen, setIsLinkToVideoModalOpen] = useState(false)
  const [isViewReelsModalOpen, setIsViewReelsModalOpen] = useState(false)
  const [selectedReel, setSelectedReel] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  })
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
    switch(postType) {
      case 'Video':
      case 'Videos':
      case 'Reel':
        return FilmIcon
      case 'Photo':
        return PhotoIcon
      case 'Text':
      case 'Status':
      case 'Link':
      case 'Links':
      default:
        return PencilIcon
    }
  }

  const formatCPM = (earnings, views) => {
    const numEarnings = Number(earnings) || 0
    const numViews = Number(views) || 0
    if (numViews === 0) return '-'
    return `$${((numEarnings / numViews) * 1000).toFixed(2)}`
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedPosts = posts?.posts ? [...posts.posts].sort((a, b) => {
    if (!sortConfig.key) return 0

    let aValue, bValue

    switch (sortConfig.key) {
      case 'title':
        aValue = a.title || ''
        bValue = b.title || ''
        break
      case 'postType':
        aValue = a.postType || ''
        bValue = b.postType || ''
        break
      case 'assetTag':
        aValue = a.assetTag || ''
        bValue = b.assetTag || ''
        break
      case 'artist':
        aValue = a.Artist?.name || ''
        bValue = b.Artist?.name || ''
        break
      case 'publishTime':
        aValue = new Date(a.publishTime)
        bValue = new Date(b.publishTime)
        break
      case 'earnings':
        aValue = Number(a.Snapshots?.[0]?.lifetimeEarnings) || 0
        bValue = Number(b.Snapshots?.[0]?.lifetimeEarnings) || 0
        break
      case 'views':
        aValue = Number(a.Snapshots?.[0]?.lifetimeQualifiedViews) || 0
        bValue = Number(b.Snapshots?.[0]?.lifetimeQualifiedViews) || 0
        break
      case 'cpm':
        const aEarnings = Number(a.Snapshots?.[0]?.lifetimeEarnings) || 0
        const aViews = Number(a.Snapshots?.[0]?.lifetimeQualifiedViews) || 0
        const bEarnings = Number(b.Snapshots?.[0]?.lifetimeEarnings) || 0
        const bViews = Number(b.Snapshots?.[0]?.lifetimeQualifiedViews) || 0
        aValue = aViews > 0 ? (aEarnings / aViews) * 1000 : 0
        bValue = bViews > 0 ? (bEarnings / bViews) * 1000 : 0
        break
      case 'status':
        aValue = a.status || ''
        bValue = b.status || ''
        break
      default:
        return 0
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  }) : []

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      : <ChevronDownIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="live">Live</option>
            <option value="removed">Removed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="Video">Video</option>
            <option value="Videos">Videos</option>
            <option value="Reel">Reel</option>
            <option value="Photo">Photo</option>
            <option value="Text">Text</option>
            <option value="Link">Link</option>
            <option value="Links">Links</option>
            <option value="Status">Status</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by title or asset tag..."
            />
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="w-2/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Post</span>
                        <SortIcon columnKey="title" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('postType')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Type</span>
                        <SortIcon columnKey="postType" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('assetTag')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Asset ID</span>
                        <SortIcon columnKey="assetTag" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('artist')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Artist</span>
                        <SortIcon columnKey="artist" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('publishTime')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Published</span>
                        <SortIcon columnKey="publishTime" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('earnings')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Earnings</span>
                        <SortIcon columnKey="earnings" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('views')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Views</span>
                        <SortIcon columnKey="views" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('cpm')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>CPM</span>
                        <SortIcon columnKey="cpm" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>Status</span>
                        <SortIcon columnKey="status" />
                      </button>
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedPosts.map((post) => {
                    const Icon = getIcon(post.postType)
                    const latestSnapshot = post.Snapshots?.[0]
                    
                    return (
                      <tr key={post.postId}>
                        <td className="w-2/12 px-3 py-4">
                          <div className="flex items-start">
                            <Icon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words line-clamp-2">
                              {post.title || 'Untitled'}
                            </div>
                          </div>
                        </td>
                        <td className="w-1/12 px-3 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {post.postType}
                          </span>
                        </td>
                        <td className="w-1/12 px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {post.assetTag ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 break-all">
                              {post.assetTag}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="w-1/12 px-3 py-4 text-sm text-gray-900 dark:text-gray-100 truncate">
                          {post.Artist?.name || 'Unassigned'}
                        </td>
                        <td className="w-1/12 px-3 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {format(new Date(post.publishTime), 'MMM d, yyyy')}
                        </td>
                        <td className="w-1/12 px-3 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          ${latestSnapshot?.lifetimeEarnings ? Number(latestSnapshot.lifetimeEarnings).toFixed(2) : '0.00'}
                        </td>
                        <td className="w-1/12 px-3 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {latestSnapshot?.lifetimeQualifiedViews ? Number(latestSnapshot.lifetimeQualifiedViews).toLocaleString() : '-'}
                        </td>
                        <td className="w-1/12 px-3 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatCPM(
                            latestSnapshot?.lifetimeEarnings,
                            latestSnapshot?.lifetimeQualifiedViews
                          )}
                        </td>
                        <td className="w-1/12 px-3 py-4">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            post.status === 'live' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="w-1/12 px-3 py-4 text-center text-sm font-medium">
                          {post.permalink ? (
                            <a
                              href={post.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                              title="View on Facebook"
                            >
                              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="w-1/12 px-3 py-4 text-center text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            {post.postType === 'Reel' && (
                              <button
                                onClick={() => {
                                  setSelectedReel(post)
                                  setIsLinkToVideoModalOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Link to Video"
                              >
                                <LinkIcon className="h-5 w-5" />
                              </button>
                            )}
                            {['Video', 'Videos'].includes(post.postType) && (
                              <button
                                onClick={() => {
                                  setSelectedVideo(post)
                                  setIsViewReelsModalOpen(true)
                                }}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="View Linked Reels"
                              >
                                <FilmIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedPost(post)
                                setIsEditModalOpen(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Edit Post"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          </div>
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
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {page * limit + 1} to {Math.min((page + 1) * limit, posts?.total || 0)} of{' '}
          {posts?.total || 0} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!posts || (page + 1) * limit >= posts.total}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      <LinkToVideoModal
        reel={selectedReel}
        isOpen={isLinkToVideoModalOpen}
        onClose={() => {
          setSelectedReel(null)
          setIsLinkToVideoModalOpen(false)
        }}
        onSuccess={() => {
          // Refresh posts data
          window.location.reload()
        }}
      />
      
      <ViewLinkedReelsModal
        video={selectedVideo}
        isOpen={isViewReelsModalOpen}
        onClose={() => {
          setSelectedVideo(null)
          setIsViewReelsModalOpen(false)
        }}
      />
    </div>
  )
}