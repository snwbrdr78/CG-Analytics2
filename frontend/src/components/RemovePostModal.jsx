import { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ExclamationTriangleIcon, FilmIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

export default function RemovePostModal({ post, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [childReels, setChildReels] = useState([])
  const [removeAll, setRemoveAll] = useState(false)
  const [reason, setReason] = useState('')
  const [checkingChildren, setCheckingChildren] = useState(false)

  useEffect(() => {
    if (isOpen && post && ['Video', 'Videos'].includes(post.postType)) {
      checkForChildReels()
    }
  }, [isOpen, post])

  const checkForChildReels = async () => {
    setCheckingChildren(true)
    try {
      const response = await api.get(`/video-reels/video/${post.postId}/check-children`)
      setChildReels(response.data.children || [])
    } catch (error) {
      console.error('Error checking for child reels:', error)
    } finally {
      setCheckingChildren(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      // Remove the main post
      await api.patch(`/posts/${post.postId}/status`, { 
        status: 'removed',
        reason 
      })

      // If removeAll is checked and there are child reels, remove them too
      if (removeAll && childReels.length > 0) {
        const reelIds = childReels.map(reel => reel.postId)
        await api.post('/posts/bulk-remove', { 
          postIds: reelIds,
          reason: `Removed with parent video: ${reason}`
        })
        toast.success(`Removed video and ${reelIds.length} associated reels`)
      } else {
        toast.success('Post marked as removed')
      }

      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Failed to remove post')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!post) return null

  const hasChildReels = childReels.length > 0

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Mark {post.postType} as Removed
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          This will change the status from "live" to "removed". The {post.postType.toLowerCase()} will remain visible with its lifetime data.
                        </p>
                        
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {post.title || 'Untitled'}
                          </p>
                          {post.assetTag && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Asset ID: {post.assetTag}
                            </p>
                          )}
                        </div>

                        {checkingChildren ? (
                          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Checking for associated reels...
                          </p>
                        ) : hasChildReels && (
                          <div className="mt-4">
                            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                              <p className="text-sm font-medium">
                                This video has {childReels.length} associated reel{childReels.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            
                            <div className="mt-2 max-h-32 overflow-y-auto">
                              {childReels.map(reel => (
                                <div key={reel.postId} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                                  <FilmIcon className="h-4 w-4 inline mr-1" />
                                  {reel.title || 'Untitled Reel'}
                                </div>
                              ))}
                            </div>

                            <div className="mt-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={removeAll}
                                  onChange={(e) => setRemoveAll(e.target.checked)}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  Also remove all associated reels
                                </span>
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reason for removal (optional)
                          </label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            placeholder="e.g., Copyright issue, outdated content, etc."
                          />
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> If this content is re-uploaded to Facebook later, it will be tracked as a new iteration when it appears in future reports.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={loading || checkingChildren}
                    onClick={handleRemove}
                    className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                  >
                    {loading ? 'Updating...' : hasChildReels && removeAll ? `Mark Video & ${childReels.length} Reels as Removed` : 'Mark as Removed'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}