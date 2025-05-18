import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const orderId = searchParams.get('id');

  if (orderId) {
    const order = mockOrders.find(o => o.id === Number(orderId));
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  if (userId) {
    const userOrders = mockOrders.filter(o => o.userId === Number(userId));
    return NextResponse.json(userOrders);
  }

  return NextResponse.json(mockOrders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, items } = body;

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);

  const newOrder = {
    id: mockOrders.length + 1,
    userId,
    items,
    status: "PENDING",
    totalAmount,
    orderDate: new Date().toISOString()
  };

  mockOrders.push(newOrder);

  return NextResponse.json(newOrder, { status: 201 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');
  const body = await request.json();

  const orderIndex = mockOrders.findIndex(o => o.id === Number(orderId));
  
  if (orderIndex === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  mockOrders[orderIndex] = {
    ...mockOrders[orderIndex],
    ...body
  };

  return NextResponse.json(mockOrders[orderIndex]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');

  const orderIndex = mockOrders.findIndex(o => o.id === Number(orderId));
  
  if (orderIndex === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  mockOrders.splice(orderIndex, 1);

  return new NextResponse(null, { status: 204 });
} 