import { useState } from 'react'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters'

export default function Reports() {
  usePageTitle('Reports')
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((currentDate.getMonth() + 1) / 3))

  const { data: monthlyReport } = useQuery(
    ['monthly-report', selectedYear, selectedMonth],
    () => api.get(`/reports/royalty/${selectedYear}/${selectedMonth}`).then(res => res.data),
    { enabled: !!selectedYear && !!selectedMonth }
  )

  const { data: quarterlyReport } = useQuery(
    ['quarterly-report', selectedYear, selectedQuarter],
    () => api.get(`/reports/quarterly/${selectedYear}/${selectedQuarter}`).then(res => res.data),
    { enabled: !!selectedYear && !!selectedQuarter }
  )

  const downloadCSV = async () => {
    try {
      const response = await api.get(
        `/reports/export/royalty/${selectedYear}/${selectedMonth}`,
        { responseType: 'blob' }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `royalty-report-${selectedYear}-${selectedMonth}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>

      {/* Report Type Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-indigo-500 py-2 px-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Monthly Royalty
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600">
              Quarterly Summary
            </button>
          </nav>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {months.map((month, idx) => (
              <option key={idx} value={idx + 1}>{month}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Monthly Report Summary */}
      {monthlyReport && (
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {months[selectedMonth - 1]} {selectedYear} Royalty Report
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Total Earnings:</span> <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatCurrency(monthlyReport.summary?.totalEarnings || 0)}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="font-medium">Total Royalties:</span> <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatCurrency(monthlyReport.summary?.totalRoyalties || 0)}</span>
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Earnings
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Posts
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Royalty Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Royalty Owed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {monthlyReport.report?.map((row) => (
                    <tr key={row.artist.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {row.artist.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                        {formatCurrency(row.metrics.totalEarnings)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 text-right">
                        {formatNumber(row.metrics.totalViews)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 text-center">
                        {formatNumber(row.metrics.postCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 text-center">
                        {formatPercentage(row.royalty.rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400 text-right">
                        {formatCurrency(row.royalty.owed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quarterly Summary */}
      {quarterlyReport && (
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Q{selectedQuarter} {selectedYear} Summary
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {quarterlyReport.period.start} to {quarterlyReport.period.end}
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Earnings
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(quarterlyReport.summary?.totalEarnings || 0)}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Views
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatNumber(quarterlyReport.summary?.totalViews || 0)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}