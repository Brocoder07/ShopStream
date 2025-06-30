'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { useAuthStore } from '@/lib/store/auth';
import { api } from '@/lib/api/client';
import { User } from '@/lib/api/types';

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentResponse {
  status: string;
  reference: string;
}

interface OrderResponse {
  id: number;
  userId: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  status: string;
  totalAmount: number;
  orderDate: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );
  const { user, token, initialize, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Handle hydration
  useEffect(() => {
    initialize();
    setIsHydrated(true);
  }, [initialize]);

  async function fetchUserProfile() {
    try {
      const profile = await api.get<User>('/auth/profile');
      setAuth(profile, token || '');
      return true;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      return false;
    }
  }

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const authState = useAuthStore.getState();
    console.log('Checkout page auth state:', { 
      user: authState.user, 
      token: authState.token, 
      isAuthenticated: authState.isAuthenticated 
    });

    if (!authState.token) {
      console.log('No token found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (!authState.user) {
      console.log('Token found but no user, attempting to fetch profile');
      fetchUserProfile().then(success => {
        if (!success) {
          console.log('Failed to fetch profile, redirecting to login');
          router.push('/auth/login');
        }
      });
      return;
    }

    if (items.length === 0) {
      console.log('Cart is empty, redirecting to cart');
      router.push('/cart');
      return;
    }
  }, [isHydrated, router, items.length, token, setAuth]);

  if (!isHydrated) {
    return <div className="text-center">Loading...</div>;
  }

  if (!user || !token) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Starting payment simulation...');
      // First, simulate payment
      const paymentResponse = await api.post<PaymentResponse>('/api/payment/simulate', {
        amount: totalAmount,
        cardNumber: paymentInfo.cardNumber,
      });
      console.log('Payment simulation response:', paymentResponse);

      if (paymentResponse.status !== 'Payment Successful') {
        throw new Error('Payment failed');
      }

      console.log('Payment successful, placing order...');
      // Then, place the order
      const orderResponse = await api.post<OrderResponse>('/api/orders/place', 
        Object.fromEntries(
          items.map(item => [item.productId.toString(), item.quantity])
        )
      );
      console.log('Order placement response:', orderResponse);

      // Clear cart and redirect to order confirmation
      clearCart();
      router.push(`/orders/${orderResponse.id}`);
    } catch (err) {
      console.error('Error during order placement:', err);
      setError('Failed to process your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={shippingInfo.fullName}
                onChange={handleShippingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={shippingInfo.address}
                onChange={handleShippingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={shippingInfo.city}
                onChange={handleShippingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                value={shippingInfo.state}
                onChange={handleShippingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                required
                value={shippingInfo.zipCode}
                onChange={handleShippingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                required
                value={shippingInfo.country}
                onChange={handleShippingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                required
                placeholder="1234 5678 9012 3456"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                required
                placeholder="MM/YY"
                value={paymentInfo.expiryDate}
                onChange={handlePaymentChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                required
                placeholder="123"
                value={paymentInfo.cvv}
                onChange={handlePaymentChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
} 