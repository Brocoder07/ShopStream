'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Product } from '@/lib/api/types';
import { useCartStore } from '@/lib/store/cart';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await api.get<Product>(`/api/products/${params.id}`);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return <div className="text-center">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="text-center text-red-500">{error || 'Product not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
          
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => addItem(product, quantity)}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Category:</span> {product.category}
            </li>
            <li>
              <span className="font-medium">Stock:</span> {product.stock} units
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 