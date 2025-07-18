import { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, FilmIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import api from '../utils/api'

export default function ViewLinkedReelsModal({ video, isOpen, onClose }) {
  const [linkedReels, setLinkedReels] = useState([])
  const [aggregateData, setAggregateData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && video) {
      fetchLinkedReelsAndAggregates()
    }
  }, [isOpen, video])

  const fetchLinkedReelsAndAggregates = async () => {
    setLoading(true)
    try {
      const [reelsRes, aggregateRes] = await Promise.all([
        api.get(`/video-reels/video/${video.postId}/reels`),
        api.get(`/video-reels/video/${video.postId}/aggregate-analytics`)
      ])

      setLinkedReels(reelsRes.data.data || [])
      setAggregateData(aggregateRes.data.data || null)
    } catch (error) {
      console.error('Error fetching linked reels:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
  }

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
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
                      <FilmIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Linked Reels for Video
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Video: <strong>{video.title || 'Untitled'}</strong>
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

                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                  ) : (
                    <>
                      {/* Aggregate Statistics */}
                      {aggregateData && (
                        <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Aggregate Analytics (Video + {linkedReels.length} Reels)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total Earnings</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(aggregateData.aggregates?.totalEarnings)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatNumber(aggregateData.aggregates?.totalViews)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Avg CPM</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                ${aggregateData.aggregates?.totalViews > 0 
                                  ? ((aggregateData.aggregates.totalEarnings / aggregateData.aggregates.totalViews) * 1000).toFixed(2)
                                  : '0.00'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Content Count</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {aggregateData.aggregates?.postCount || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Linked Reels List */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Linked Reels ({linkedReels.length})
                        </h4>
                        {linkedReels.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No reels are currently linked to this video
                          </p>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {linkedReels.map(reel => (
                              <div key={reel.postId} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <FilmIcon className="h-5 w-5 text-gray-400" />
                                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {reel.title || 'Untitled Reel'}
                                      </h5>
                                    </div>
                                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                      <span>Published: {format(new Date(reel.publishTime), 'MMM d, yyyy')}</span>
                                      {reel.assetTag && <span>Asset ID: {reel.assetTag}</span>}
                                      {reel.Artist?.name && <span>Artist: {reel.Artist.name}</span>}
                                    </div>
                                    {reel.Snapshots?.[0] && (
                                      <div className="mt-2 flex items-center space-x-4 text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">
                                          Earnings: {formatCurrency(reel.Snapshots[0].lifetimeEarnings)}
                                        </span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                          Views: {formatNumber(reel.Snapshots[0].lifetimeQualifiedViews)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                      reel.status === 'live' 
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}>
                                      {reel.status}
                                    </span>
                                  </div>
                                </div>
                                {reel.inheritMetadata && (
                                  <div className="mt-2">
                                    <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400">
                                      <span className="mr-1">↳</span> Inherits metadata from parent
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:w-auto"
                  >
                    Close
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