import { useState, useEffect } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

export default function EditPostModal({ post, isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artistId: ''
  })
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [childReels, setChildReels] = useState([])
  const [checkingChildren, setCheckingChildren] = useState(false)

  // Fetch artists for dropdown
  const { data: artists } = useQuery('artists', 
    () => api.get('/artists').then(res => res.data)
  )

  // Update post mutation
  const updatePost = useMutation(
    (data) => api.put(`/posts/${post.postId}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts')
        onClose()
      }
    }
  )

  // Remove post mutation
  const removePost = useMutation(
    () => api.patch(`/posts/${post.postId}/status`, { status: 'removed' }),
    {
      onSuccess: (response) => {
        if (response.data.warning) {
          toast.warning(response.data.warning)
        } else {
          toast.success('Post marked as removed')
        }
        queryClient.invalidateQueries('posts')
        onClose()
      }
    }
  )

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        artistId: post.artistId || ''
      })
    }
  }, [post])

  const handleSubmit = (e) => {
    e.preventDefault()
    updatePost.mutate(formData)
  }

  const checkForChildren = async () => {
    if (!['Video', 'Videos'].includes(post?.postType)) {
      // Not a video, proceed with removal
      removePost.mutate()
      return
    }

    setCheckingChildren(true)
    try {
      const response = await api.get(`/video-reels/video/${post.postId}/check-children`)
      const { hasChildren, children } = response.data
      
      if (hasChildren) {
        setChildReels(children)
        setShowRemoveConfirm(true)
      } else {
        // No children, proceed with removal
        removePost.mutate()
      }
    } catch (error) {
      toast.error('Failed to check for child reels')
    } finally {
      setCheckingChildren(false)
    }
  }

  const handleRemove = () => {
    checkForChildren()
  }

  const confirmRemove = () => {
    removePost.mutate()
    setShowRemoveConfirm(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Post ID
            </label>
            <input
              type="text"
              value={post?.postId || ''}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Artist
            </label>
            <select
              value={formData.artistId}
              onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Unassigned</option>
              {artists?.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name} ({artist.royaltyRate}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Post Type
            </label>
            <input
              type="text"
              value={post?.postType || ''}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Asset Tag
            </label>
            <input
              type="text"
              value={post?.assetTag || 'N/A'}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleRemove}
              disabled={checkingChildren || removePost.isLoading || post?.status === 'removed'}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 border border-transparent rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
            >
              {checkingChildren ? 'Checking...' : post?.status === 'removed' ? 'Already Removed' : 'Mark as Removed'}
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatePost.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
              >
                {updatePost.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {/* Remove Confirmation Dialog */}
        {showRemoveConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Warning: Video has linked reels
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This video has {childReels.length} linked reel{childReels.length !== 1 ? 's' : ''} that are still live:
              </p>
              
              <div className="max-h-32 overflow-y-auto mb-4 space-y-1">
                {childReels.map(reel => (
                  <div key={reel.postId} className="text-sm text-gray-700 dark:text-gray-300">
                    • {reel.title || 'Untitled Reel'}
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Removing this video will not affect the reels, but they will lose their parent association.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 border border-transparent rounded-md hover:bg-red-700 dark:hover:bg-red-600"
                >
                  Remove Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}