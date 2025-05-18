'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Order } from '@/lib/api/types';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    async function fetchOrders() {
      try {
        const data = await api.get<Order[]>('/api/orders/my');
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated, router]);

  if (loading) {
    return <div className="text-center">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No Orders Found</h1>
        <p className="text-gray-600">You haven't placed any orders yet.</p>
        <Link
          href="/products"
          className="inline-block mt-4 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Link href={`/orders/${order.id}`} className="text-lg font-semibold hover:text-blue-600">
                  Order #{order.id}
                </Link>
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

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Product #{item.productId}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 