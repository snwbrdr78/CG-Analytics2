import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { useState, Fragment } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Menu, Transition } from '@headlessui/react'
import Footer from './Footer'
import ChangePasswordModal from './ChangePasswordModal'
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
  Cog6ToothIcon,
  LockClosedIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

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
          <img 
            src="/LOGO-White-NoBackdropCrisp.png" 
            alt="CG Analytics" 
            className="h-10 w-auto"
          />
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
        
        {/* User menu */}
        <div className="mt-auto p-4 border-t border-gray-800 dark:border-gray-700">
          <Menu as="div" className="relative">
            <Menu.Button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {user?.role || 'user'}
                  </p>
                </div>
              </div>
              <ChevronUpIcon className="h-4 w-4 text-gray-400" />
            </Menu.Button>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute bottom-full left-0 right-0 mb-2 origin-bottom-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <LockClosedIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        Change Password
                      </button>
                    )}
                  </Menu.Item>
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
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
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </div>
  )
}