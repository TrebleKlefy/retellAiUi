import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  PhoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Leads', href: '/leads', icon: UserGroupIcon },
  { name: 'Calls', href: '/calls', icon: PhoneIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const adminNavigation = [
  { name: 'Users', href: '/users', icon: UserCircleIcon },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { sidebarOpen } = useApp();

  const isAdmin = user?.role === UserRole.ADMIN;
  const allNavigation = [...navigation, ...(isAdmin ? adminNavigation : [])];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Retell AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {allNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.firstName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 