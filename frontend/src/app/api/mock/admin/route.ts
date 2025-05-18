import { NextResponse } from 'next/server';

// Reuse the mock products from the products route
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

// Reuse the mock orders from the orders route
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

// Product management endpoints
export async function POST(request: Request) {
  const body = await request.json();
  
  const newProduct = {
    id: mockProducts.length + 1,
    ...body,
    stock: body.stock || 0
  };

  mockProducts.push(newProduct);
  
  return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const body = await request.json();

  const productIndex = mockProducts.findIndex(p => p.id === Number(id));
  
  if (productIndex === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  mockProducts[productIndex] = {
    ...mockProducts[productIndex],
    ...body
  };

  return NextResponse.json(mockProducts[productIndex]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const productIndex = mockProducts.findIndex(p => p.id === Number(id));
  
  if (productIndex === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  mockProducts.splice(productIndex, 1);

  return new NextResponse(null, { status: 204 });
}

// Order management endpoints
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'orders') {
    return NextResponse.json(mockOrders);
  }

  return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');
  const status = searchParams.get('status');

  if (!orderId || !status) {
    return NextResponse.json({ error: 'Missing order ID or status' }, { status: 400 });
  }

  const orderIndex = mockOrders.findIndex(o => o.id === Number(orderId));
  
  if (orderIndex === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  mockOrders[orderIndex] = {
    ...mockOrders[orderIndex],
    status: status
  };

  return NextResponse.json(mockOrders[orderIndex]);
} 