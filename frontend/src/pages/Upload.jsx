import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, ExclamationTriangleIcon, LinkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import ContentMatchingModal from '../components/ContentMatchingModal'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDate } from '../utils/formatters'

export default function Upload() {
  usePageTitle('Upload Data')
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState(null)
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0])
  const [duplicateWarning, setDuplicateWarning] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [showMatchingModal, setShowMatchingModal] = useState(false)
  const [newPostsForMatching, setNewPostsForMatching] = useState([])

  const checkForDuplicates = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('snapshotDate', snapshotDate)

    try {
      const response = await api.post('/upload-check/check-duplicate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      return response.data
    } catch (error) {
      console.error('Duplicate check error:', error)
      return { isDuplicate: false }
    }
  }

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('snapshotDate', snapshotDate)

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setUploadResults(response.data.results)
      toast.success('File uploaded successfully!')
      
      // Check if there are new posts that might be re-uploads
      if (response.data.summary?.newPosts > 0) {
        console.log('New posts created:', response.data.summary.newPosts)
        
        // Get the newly created posts
        const newPostsResponse = await api.get('/posts', {
          params: {
            limit: response.data.summary.newPosts,
            status: 'live',
            // Get posts created in the last 5 minutes
            createdAfter: new Date(Date.now() - 300000).toISOString()
          }
        })
        
        console.log('Upload summary:', response.data.summary)
        console.log('New posts query params:', {
          limit: response.data.summary.newPosts,
          status: 'live',
          createdAfter: new Date(Date.now() - 300000).toISOString()
        })
        console.log('New posts response:', newPostsResponse.data)
        console.log('Found new posts:', newPostsResponse.data.posts?.length)
        
        if (newPostsResponse.data.posts && newPostsResponse.data.posts.length > 0) {
          // Show matching modal after a short delay to let user see upload results first
          setTimeout(() => {
            console.log('Setting posts for matching:', newPostsResponse.data.posts)
            setNewPostsForMatching(newPostsResponse.data.posts)
            setShowMatchingModal(true)
          }, 1500)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
      console.error(error)
    }
  }

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setPendingFile(file)
    setDuplicateWarning(null)

    try {
      // Check for duplicates first
      const duplicateCheck = await checkForDuplicates(file)
      
      if (duplicateCheck.isDuplicate) {
        setDuplicateWarning(duplicateCheck)
        setUploading(false)
        return
      }
      
      // No duplicates, proceed with upload
      await uploadFile(file)
    } catch (error) {
      toast.error('Upload failed')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateDate = async () => {
    if (!duplicateWarning || !pendingFile) return
    
    setUploading(true)
    
    try {
      // First, get the post IDs from parsing the file
      const formData = new FormData()
      formData.append('file', pendingFile)
      formData.append('snapshotDate', duplicateWarning.existingDate)
      
      // Upload with the existing date to get post IDs
      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const postIds = Object.keys(uploadResponse.data.results.posts || {})
      
      // Update the snapshot dates
      await api.post('/upload-check/update-snapshot-date', {
        oldDate: duplicateWarning.existingDate,
        newDate: snapshotDate,
        postIds: postIds
      })
      
      setUploadResults(uploadResponse.data.results)
      toast.success(`Updated snapshot date from ${duplicateWarning.existingDate} to ${snapshotDate}`)
      setDuplicateWarning(null)
      setPendingFile(null)
    } catch (error) {
      toast.error('Failed to update snapshot date')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const onDropOwnerMapping = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload/owner-mapping', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Owner mapping uploaded successfully!')
      console.log(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: uploading
  })

  const { 
    getRootProps: getOwnerRootProps, 
    getInputProps: getOwnerInputProps 
  } = useDropzone({
    onDrop: onDropOwnerMapping,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Data</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Facebook Export Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Facebook Export CSV
          </h2>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors
              ${uploading 
                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' 
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {uploading 
                ? 'Uploading...' 
                : 'Drop Facebook CSV here or click to browse'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              CSV files only
            </p>
          </div>
          <div className="mt-4">
            <label htmlFor="snapshot-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Snapshot Date
            </label>
            <input
              type="date"
              id="snapshot-date"
              value={snapshotDate}
              onChange={(e) => setSnapshotDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter the date when this CSV was generated by Facebook (check the file's creation date)
            </p>
          </div>
        </div>

        {/* Owner Mapping Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Owner Mapping CSV
          </h2>
          <div
            {...getOwnerRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors
              ${uploading 
                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' 
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
              }
            `}
          >
            <input {...getOwnerInputProps()} />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {uploading 
                ? 'Uploading...' 
                : 'Drop owner mapping CSV here or click to browse'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maps posts to artists for royalty calculation
            </p>
          </div>
        </div>
      </div>

      {/* Duplicate Warning Dialog */}
      {duplicateWarning && (
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100">
                Duplicate Data Detected
              </h3>
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                This data already exists with a snapshot date of <strong>{duplicateWarning.existingDate}</strong>.
                You're trying to upload it with date <strong>{duplicateWarning.proposedDate}</strong>.
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Match confidence: {duplicateWarning.matchScore}%
              </p>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpdateDate}
                  disabled={uploading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Updating...' : `Update date from ${duplicateWarning.existingDate} to ${snapshotDate}`}
                </button>
                <button
                  onClick={() => {
                    setDuplicateWarning(null)
                    setPendingFile(null)
                  }}
                  disabled={uploading}
                  className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
              
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> Updating the date will move all snapshots from {duplicateWarning.existingDate} to {snapshotDate} for the posts in this CSV.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Upload Results
          </h3>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Posts Created</dt>
              <dd className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {uploadResults.created?.posts || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Posts Updated</dt>
              <dd className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {uploadResults.updated?.posts || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Snapshots Created</dt>
              <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {uploadResults.created?.snapshots || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Errors</dt>
              <dd className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                {uploadResults.errors?.length || 0}
              </dd>
            </div>
          </dl>
          
          {uploadResults.errors?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Errors:</h4>
              <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                {uploadResults.errors.map((error, idx) => (
                  <li key={idx}>
                    Post {error.postId}: {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {uploadResults.metadata?.snapshotDate && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Snapshot Date:</strong> {formatDate(uploadResults.metadata.snapshotDate, true)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                This CSV shows lifetime data as of this date for content created during the reporting period.
              </p>
            </div>
          )}
        </div>
      )}
      
      <ContentMatchingModal
        newPosts={newPostsForMatching}
        isOpen={showMatchingModal}
        onClose={() => {
          setShowMatchingModal(false)
          setNewPostsForMatching([])
        }}
        onSuccess={() => {
          // Refresh or show success message
          toast.success('Content successfully linked to previous iterations')
        }}
      />
    </div>
  )
}