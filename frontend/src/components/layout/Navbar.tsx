'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { totalItems } = useCartStore();

  return (
    <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800 focus-ring">
            ShopStream
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 focus-ring">
              Products
            </Link>
            
            <Link 
              href="/cart" 
              className="text-gray-600 hover:text-gray-900 relative focus-ring"
              aria-label={`Cart (${totalItems} items)`}
            >
              Cart
              {totalItems > 0 && (
                <span 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full cart-badge flex items-center justify-center text-xs"
                  aria-label={`${totalItems} items in cart`}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/orders" 
                  className="text-gray-600 hover:text-gray-900 focus-ring"
                >
                  Orders
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-600 hover:text-gray-900 focus-ring"
                >
                  Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link 
                    href="/admin" 
                    className="text-gray-600 hover:text-gray-900 focus-ring"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={clearAuth}
                  className="text-gray-600 hover:text-gray-900 focus-ring btn"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-900 focus-ring"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 