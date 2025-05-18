import { NextResponse } from 'next/server';

const mockUsers = [
  {
    id: 1,
    email: "admin@example.com",
    password: "admin123", // In real app, this would be hashed
    username: "Admin User",
    role: "ADMIN"
  },
  {
    id: 2,
    email: "user@example.com",
    password: "user123", // In real app, this would be hashed
    username: "Regular User",
    role: "USER"
  }
];

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, username } = body;

  // Login
  if (!username) {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  }

  // Register
  if (mockUsers.some(u => u.email === email)) {
    return NextResponse.json(
      { error: 'Email already exists' },
      { status: 400 }
    );
  }

  const newUser = {
    id: mockUsers.length + 1,
    email,
    password, // In real app, this would be hashed
    username,
    role: "USER"
  };

  mockUsers.push(newUser);

  // Mock JWT token
  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;

  return NextResponse.json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role
    }
  }, { status: 201 });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const userId = parseInt(token.split('-')[2]);

  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  });
} 