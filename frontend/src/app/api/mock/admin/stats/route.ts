import { NextResponse } from 'next/server';

// Reuse the mock data from other routes
const mockProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    stock: 50,
    category: "Electronics"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Track your fitness goals with this advanced smartwatch",
    price: 149.99,
    stock: 30,
    category: "Electronics"
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and eco-friendly cotton t-shirt",
    price: 29.99,
    stock: 100,
    category: "Clothing"
  }
];

const mockOrders = [
  {
    id: 1,
    userId: 2,
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 399.98
      }
    ],
    status: "PENDING",
    totalAmount: 399.98,
    orderDate: "2024-03-15T10:30:00Z"
  },
  {
    id: 2,
    userId: 2,
    items: [
      {
        productId: 2,
        quantity: 1,
        price: 149.99
      },
      {
        productId: 3,
        quantity: 3,
        price: 89.97
      }
    ],
    status: "COMPLETED",
    totalAmount: 239.96,
    orderDate: "2024-03-14T15:45:00Z"
  }
];

export async function GET() {
  // Calculate total revenue
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Calculate total orders
  const totalOrders = mockOrders.length;

  // Calculate total products
  const totalProducts = mockProducts.length;

  // Calculate low stock products (less than 20 items)
  const lowStockProducts = mockProducts.filter(product => product.stock < 20).length;

  // Calculate orders by status
  const ordersByStatus = mockOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate revenue by category
  const revenueByCategory = mockOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product) {
        acc[product.category] = (acc[product.category] || 0) + item.price;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Get recent orders with product details
  const recentOrders = mockOrders
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5)
    .map(order => ({
      id: order.id,
      date: order.orderDate,
      status: order.status,
      total: order.totalAmount,
      items: order.items.map(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        return {
          name: product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price
        };
      })
    }));

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    totalProducts,
    lowStockProducts,
    ordersByStatus,
    revenueByCategory,
    recentOrders
  });
} 