import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg className="w-8 h-8 text-primary-800 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">TaxEase</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-primary-800 px-3 py-2 text-sm font-medium transition-colors">
              Features
            </button>
            <button className="text-gray-600 hover:text-primary-800 px-3 py-2 text-sm font-medium transition-colors">
              Pricing
            </button>
            <button className="text-gray-600 hover:text-primary-800 px-3 py-2 text-sm font-medium transition-colors">
              Support
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.firstName || user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-primary-800 border-primary-800 hover:bg-primary-50"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  className="text-primary-800 hover:text-primary-700"
                >
                  Login
                </Button>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-primary-800 text-white hover:bg-primary-700"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
