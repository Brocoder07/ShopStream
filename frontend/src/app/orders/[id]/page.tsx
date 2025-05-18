'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Order } from '@/lib/api/types';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    async function fetchOrder() {
      try {
        const data = await api.get<Order>(`/api/orders/${params.id}`);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id, isAuthenticated, router]);

  if (loading) {
    return <div className="text-center">Loading order details...</div>;
  }

  if (error || !order) {
    return <div className="text-center text-red-500">{error || 'Order not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-blue-500 hover:text-blue-600"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-medium">Product #{item.productId}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-xl font-bold">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 