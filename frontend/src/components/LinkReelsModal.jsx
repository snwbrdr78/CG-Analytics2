import { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, LinkIcon, FilmIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

export default function LinkReelsModal({ video, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [availableReels, setAvailableReels] = useState([])
  const [linkedReels, setLinkedReels] = useState([])
  const [selectedReels, setSelectedReels] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen && video) {
      fetchReels()
    }
  }, [isOpen, video])

  const fetchReels = async () => {
    try {
      // Fetch all reels
      const [allReelsRes, linkedReelsRes] = await Promise.all([
        api.get('/posts', { 
          params: { 
            type: 'Reel',
            limit: 100,
            status: 'live'
          } 
        }),
        api.get(`/video-reels/video/${video.postId}/reels`)
      ])

      const linked = linkedReelsRes.data.data || []
      const linkedIds = linked.map(r => r.postId)
      
      // Filter out already linked reels
      const available = (allReelsRes.data.posts || []).filter(
        reel => !linkedIds.includes(reel.postId) && reel.postId !== video.postId
      )

      setLinkedReels(linked)
      setAvailableReels(available)
    } catch (error) {
      console.error('Error fetching reels:', error)
      toast.error('Failed to load reels')
    }
  }

  const handleLinkReels = async () => {
    if (selectedReels.length === 0) {
      toast.error('Please select at least one reel')
      return
    }

    setLoading(true)
    try {
      await api.post('/video-reels/bulk-link-reels', {
        reelPostIds: selectedReels,
        parentVideoPostId: video.postId,
        inheritMetadata: true
      })

      toast.success(`${selectedReels.length} reels linked successfully`)
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Failed to link reels')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlinkReel = async (reelId) => {
    try {
      await api.post('/video-reels/unlink-reel', {
        reelPostId: reelId
      })
      
      toast.success('Reel unlinked')
      fetchReels()
    } catch (error) {
      toast.error('Failed to unlink reel')
    }
  }

  const filteredReels = availableReels.filter(reel =>
    reel.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reel.assetTag?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!video) return null

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                      <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Link Reels to Video
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Parent Video: <strong>{video.title}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Currently Linked Reels */}
                  {linkedReels.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Currently Linked Reels ({linkedReels.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {linkedReels.map(reel => (
                          <div key={reel.postId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="flex items-center space-x-2">
                              <FilmIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {reel.title || 'Untitled'}
                              </span>
                              {reel.assetTag && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({reel.assetTag})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleUnlinkReel(reel.postId)}
                              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Unlink
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  <div className="mt-6">
                    <input
                      type="text"
                      placeholder="Search available reels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Available Reels */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Available Reels ({filteredReels.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredReels.map(reel => (
                        <label
                          key={reel.postId}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedReels.includes(reel.postId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReels([...selectedReels, reel.postId])
                              } else {
                                setSelectedReels(selectedReels.filter(id => id !== reel.postId))
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <FilmIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {reel.title || 'Untitled'}
                              </span>
                              {reel.assetTag && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({reel.assetTag})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(reel.publishTime).toLocaleDateString()}
                              {reel.Artist?.name && ` • ${reel.Artist.name}`}
                            </div>
                          </div>
                        </label>
                      ))}
                      {filteredReels.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No available reels found
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={loading || selectedReels.length === 0}
                    onClick={handleLinkReels}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                  >
                    {loading ? 'Linking...' : `Link ${selectedReels.length} Reel${selectedReels.length !== 1 ? 's' : ''}`}
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