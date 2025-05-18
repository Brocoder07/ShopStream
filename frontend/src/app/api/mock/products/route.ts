import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let filteredProducts = [...mockProducts];

  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  return NextResponse.json(filteredProducts);
}

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