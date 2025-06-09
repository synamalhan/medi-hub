import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { ActivitySquare} from 'lucide-react';
const Layout: React.FC = () => {
  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="ml-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
      <footer className="bg-white border-t border-neutral-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-40">
            <div className="flex items-center gap-20">
              <ActivitySquare className="w-5 h-5 text-primary-500" />
              <p className="text-sm text-neutral-600 padding-left-20">
                ......   © 2025 mediTalk. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4 text-neutral-600">
              <div className="flex items-center">
                <span className="text-xs">Built with</span>
                <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-primary-500 hover:underline">
                  Bolt.new
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </>
  );
};

export default Layout;