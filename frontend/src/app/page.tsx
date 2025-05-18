'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { Product } from '@/lib/api/types';
import { useCartStore } from '@/lib/store/cart';

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const { addItem } = useCartStore();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.get<Product[]>('/api/products');
        setProducts(data);
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" role="status" aria-label="Loading products">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 shadow-sm">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="container mx-auto px-4 py-8 text-center error-message"
        role="alert"
        aria-live="polite"
      >
        <svg 
          className="w-5 h-5 mx-auto mb-2" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8" role="search">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border rounded-lg form-input bg-white text-gray-900"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 btn"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </form>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Categories</h2>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Product categories">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 focus-ring"
              role="listitem"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Products</h2>
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="list"
        aria-label="Featured products"
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
            role="listitem"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{product.name}</h3>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              <button
                onClick={() => addItem(product, 1)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 btn"
                aria-label={`Add ${product.name} to cart`}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
