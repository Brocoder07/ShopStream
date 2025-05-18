import { NextResponse } from 'next/server';

interface PaymentRequest {
  amount: number;
  cardNumber: string;
}

export async function POST(request: Request) {
  try {
    const body: PaymentRequest = await request.json();
    const { amount, cardNumber } = body;

    // Basic validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      return NextResponse.json(
        { error: 'Invalid card number' },
        { status: 400 }
      );
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate random payment success/failure (90% success rate)
    const isSuccessful = Math.random() < 0.9;

    if (!isSuccessful) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment declined by bank'
        },
        { status: 400 }
      );
    }

    // Generate a mock transaction ID
    const transactionId = `txn_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      transactionId,
      amount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 