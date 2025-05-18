'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products"
            className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Manage Orders
          </Link>
          <Link
            href="/admin/users"
            className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
} 