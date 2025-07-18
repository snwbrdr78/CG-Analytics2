import { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, LinkIcon, FilmIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

export default function LinkToVideoModal({ reel, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [availableVideos, setAvailableVideos] = useState([])
  const [currentParent, setCurrentParent] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [inheritMetadata, setInheritMetadata] = useState(true)

  useEffect(() => {
    if (isOpen && reel) {
      fetchVideosAndParent()
    }
  }, [isOpen, reel])

  const fetchVideosAndParent = async () => {
    try {
      // Fetch available videos and current parent
      const [videosRes, parentRes] = await Promise.all([
        api.get('/posts', { 
          params: { 
            type: 'Video',
            limit: 100,
            status: 'live'
          } 
        }),
        reel.parentPostId ? api.get(`/posts/${reel.parentPostId}`) : Promise.resolve(null)
      ])

      setAvailableVideos(videosRes.data.posts || [])
      setCurrentParent(parentRes?.data || null)
      
      // Pre-select current parent if exists
      if (reel.parentPostId) {
        setSelectedVideo(reel.parentPostId)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast.error('Failed to load videos')
    }
  }

  const handleLinkToVideo = async () => {
    if (!selectedVideo) {
      toast.error('Please select a video')
      return
    }

    setLoading(true)
    try {
      await api.post('/video-reels/link-reel', {
        reelPostId: reel.postId,
        parentVideoPostId: selectedVideo,
        inheritMetadata
      })

      toast.success('Reel linked to video successfully')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Failed to link reel to video')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlink = async () => {
    setLoading(true)
    try {
      await api.post('/video-reels/unlink-reel', {
        reelPostId: reel.postId
      })
      
      toast.success('Reel unlinked from video')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Failed to unlink reel')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = availableVideos.filter(video =>
    video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.assetTag?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!reel) return null

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                      <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Link Reel to Parent Video
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Reel: <strong>{reel.title || 'Untitled'}</strong>
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

                  {/* Current Parent */}
                  {currentParent && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Currently Linked To:
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FilmIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {currentParent.title || 'Untitled'}
                            </p>
                            {currentParent.assetTag && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Asset ID: {currentParent.assetTag}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={handleUnlink}
                          disabled={loading}
                          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          Unlink
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  <div className="mt-6">
                    <input
                      type="text"
                      placeholder="Search videos by title or asset ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Available Videos */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Select Parent Video
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredVideos.map(video => (
                        <label
                          key={video.postId}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer border border-gray-200 dark:border-gray-600"
                        >
                          <input
                            type="radio"
                            name="parentVideo"
                            value={video.postId}
                            checked={selectedVideo === video.postId}
                            onChange={(e) => setSelectedVideo(e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <FilmIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {video.title || 'Untitled'}
                              </span>
                              {video.assetTag && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({video.assetTag})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(video.publishTime).toLocaleDateString()}
                              {video.Artist?.name && ` • ${video.Artist.name}`}
                            </div>
                          </div>
                        </label>
                      ))}
                      {filteredVideos.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No videos found
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inherit Metadata Option */}
                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={inheritMetadata}
                        onChange={(e) => setInheritMetadata(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Inherit artist assignment from parent video
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={loading || (!selectedVideo && !currentParent)}
                    onClick={handleLinkToVideo}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                  >
                    {loading ? 'Processing...' : currentParent && selectedVideo === currentParent.postId ? 'Update Settings' : 'Link to Video'}
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