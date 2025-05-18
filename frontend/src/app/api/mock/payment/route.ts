import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Simulate payment processing
  const reference = `TXN${Date.now()}`;
  
  // Simulate a successful payment response
  return NextResponse.json({
    status: "Payment Successful",
    reference: reference,
    timestamp: new Date().toISOString(),
    amount: body.amount,
    currency: body.currency || "USD"
  });
} 