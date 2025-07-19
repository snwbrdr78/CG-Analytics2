import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { darkMode } = useTheme();
  const [version, setVersion] = useState('');

  useEffect(() => {
    // Fetch version from backend
    fetch('/api/version')
      .then(res => res.json())
      .then(data => setVersion(data.version))
      .catch(() => setVersion('1.0.0'));
  }, []);
  
  return (
    <footer className={`${
      darkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'
    } py-4 px-6 mt-auto border-t`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Comedy Genius Analytics. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            v{version || 'Loading...'}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;