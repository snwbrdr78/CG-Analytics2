import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

export default function Upload() {
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState(null)

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setUploadResults(response.data.results)
      toast.success('File uploaded successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
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
        </div>
      )}
    </div>
  )
}