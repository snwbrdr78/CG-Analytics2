import { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, LinkIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { formatCurrency, formatViews } from '../utils/formatters'

export default function ContentMatchingModal({ newPosts, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [matchingPosts, setMatchingPosts] = useState([])
  const [selectedMatches, setSelectedMatches] = useState({})

  useEffect(() => {
    console.log('ContentMatchingModal - isOpen:', isOpen, 'newPosts:', newPosts)
    if (isOpen && newPosts && newPosts.length > 0) {
      findMatches()
    }
  }, [isOpen, newPosts])

  const findMatches = async () => {
    setLoading(true)
    const postsWithMatches = []

    try {
      console.log('Finding matches for posts:', newPosts)
      for (const post of newPosts) {
        console.log('Checking post:', post.postId, post.title, post.postType)
        const response = await api.post('/content-matching/find-matches', {
          title: post.title,
          postType: post.postType,
          duration: post.duration,
          assetTag: post.assetTag
        })

        console.log(`Matches for "${post.title}":`, response.data)
        if (response.data.matches && response.data.matches.length > 0) {
          postsWithMatches.push({
            ...post,
            potentialMatches: response.data.matches
          })
        }
      }

      console.log('Posts with matches:', postsWithMatches)
      setMatchingPosts(postsWithMatches)
    } catch (error) {
      console.error('Error finding matches:', error)
      toast.error('Failed to find matching content')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkPosts = async () => {
    setLoading(true)
    let successCount = 0

    try {
      for (const [newPostId, previousPostId] of Object.entries(selectedMatches)) {
        if (previousPostId) {
          await api.post('/content-matching/link-to-previous', {
            newPostId,
            previousPostId
          })
          successCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully linked ${successCount} posts to previous iterations`)
        onSuccess()
        onClose()
      } else {
        toast.error('No posts selected for linking')
      }
    } catch (error) {
      toast.error('Failed to link posts')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getMatchBadgeColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
                <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                      <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Match New Content with Previous Iterations
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          We found potential matches for new content that may be re-uploads of previously removed posts.
                          Select the correct matches to link them as new iterations.
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
                      <p className="text-gray-500 dark:text-gray-400">Finding potential matches...</p>
                    </div>
                  ) : matchingPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No potential re-uploads found.</p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto">
                      {matchingPosts.map((post) => (
                        <div key={post.postId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              New Post: {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Type: {post.postType} • ID: {post.postId}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Select matching previous iteration:
                            </p>
                            
                            <div className="space-y-1">
                              <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                  type="radio"
                                  name={`match-${post.postId}`}
                                  value=""
                                  checked={!selectedMatches[post.postId]}
                                  onChange={() => {
                                    setSelectedMatches(prev => ({
                                      ...prev,
                                      [post.postId]: null
                                    }))
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                  No match - This is new content
                                </span>
                              </label>

                              {post.potentialMatches.map((match) => (
                                <label
                                  key={match.postId}
                                  className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`match-${post.postId}`}
                                    value={match.postId}
                                    checked={selectedMatches[post.postId] === match.postId}
                                    onChange={() => {
                                      setSelectedMatches(prev => ({
                                        ...prev,
                                        [post.postId]: match.postId
                                      }))
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                                  />
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {match.title}
                                      </span>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMatchBadgeColor(match.matchScore)}`}>
                                        {match.matchScore}% match
                                      </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                      <span>Removed: {new Date(match.removedDate).toLocaleDateString()}</span>
                                      <span>Iteration: {match.iterationNumber || 1}</span>
                                      {match.Artist?.name && <span>Artist: {match.Artist.name}</span>}
                                    </div>
                                    {match.Snapshots?.[0] && (
                                      <div className="mt-1 flex items-center gap-3 text-xs">
                                        <span className="flex items-center">
                                          <ChartBarIcon className="h-3 w-3 mr-1" />
                                          {formatCurrency(match.Snapshots[0].lifetimeEarnings)}
                                        </span>
                                        <span>{formatViews(match.Snapshots[0].lifetimeQualifiedViews)} views</span>
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={loading || Object.keys(selectedMatches).length === 0}
                    onClick={handleLinkPosts}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                  >
                    {loading ? 'Processing...' : 'Link Selected Matches'}
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