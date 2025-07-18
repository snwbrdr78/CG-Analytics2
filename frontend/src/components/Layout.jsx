import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import Footer from './Footer'
import {
  HomeIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArchiveBoxXMarkIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()

  // Dynamic navigation based on user role
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Upload', href: '/upload', icon: CloudArrowUpIcon },
    { name: 'Artists', href: '/artists', icon: UserGroupIcon },
    { name: 'Posts', href: '/posts', icon: VideoCameraIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    { name: 'Removed', href: '/removed', icon: ArchiveBoxXMarkIcon },
  ]

  // Add admin panel for admin and super_admin users
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    navigation.push({
      name: 'Admin Panel',
      href: '/admin',
      icon: Cog6ToothIcon
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="flex w-64 flex-col bg-gray-900 dark:bg-gray-800">
        <div className="flex h-16 items-center justify-between px-4 bg-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-bold text-white">CG Analytics</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-gray-800 dark:bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600 hover:text-white'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-6 w-6 flex-shrink-0
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                  `}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* User info and logout */}
        <div className="mt-auto p-4 border-t border-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {user?.role || 'user'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}