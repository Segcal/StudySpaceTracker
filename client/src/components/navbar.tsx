import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">TaxEase</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-800 font-medium">
                Dashboard
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-primary-800 font-medium">
                Admin
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              {user && (
                <div className="flex items-center space-x-2">
                  <img
                    src={user.profileImageUrl || '/default-avatar.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName || user.email}
                  </span>
                </div>
              )}
              <Button
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                className="text-gray-700 hover:text-primary-800 border-gray-300"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}