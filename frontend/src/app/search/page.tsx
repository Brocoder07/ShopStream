'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { Product } from '@/lib/api/types';
import { useCartStore } from '@/lib/store/cart';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    async function searchProducts() {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const data = await api.get<Product[]>(`/api/products/search?name=${encodeURIComponent(query)}`);
        setProducts(data);
      } catch (err) {
        setError('Failed to search products');
      } finally {
        setLoading(false);
      }
    }

    searchProducts();
  }, [query]);

  if (loading) {
    return <div className="text-center">Searching products...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h1>
      
      {products.length === 0 ? (
        <div className="text-center text-gray-500">
          No products found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                <button
                  onClick={() => addItem(product, 1)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
} 