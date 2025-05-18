'use client';

import { useEffect, useMemo } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCartStore();
  const router = useRouter();

  // Calculate totals using useMemo to prevent unnecessary recalculations
  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const itemTotal = (item.product?.price || 0) * item.quantity;
      console.log('Calculating item total:', item.product?.name, itemTotal);
      return total + itemTotal;
    }, 0);
  }, [items]);

  useEffect(() => {
    console.log('Cart items:', items);
    console.log('Cart total:', cartTotal);
  }, [items, cartTotal]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link
          href="/products"
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="space-y-4">
        {items.map((item) => {
          const itemTotal = item.product.price * item.quantity;
          console.log('Rendering item:', item.product.name, 'Total:', itemTotal);
          return (
            <div key={item.productId} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">
                    ${item.product.price.toFixed(2)} × {item.quantity} = ${itemTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      console.log('Decreasing quantity for:', item.product.name);
                      updateQuantity(item.productId, item.quantity - 1);
                    }}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => {
                      console.log('Increasing quantity for:', item.product.name);
                      updateQuantity(item.productId, item.quantity + 1);
                    }}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    console.log('Removing item:', item.product.name);
                    removeItem(item.productId);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href="/products"
            className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => router.push('/checkout')}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
} 