import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { OrderResponse, getUser, getOrder } from '@/lib/handlers';

// P2
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET (
  request: NextRequest,
  {
    params,
  }: {
    params: { userId: string, orderId: string };
  }
): Promise<NextResponse<OrderResponse | {} >> {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({}, { status: 401 });
  }
  // 400: Invalid user ID or invalid order ID
  if (!Types.ObjectId.isValid(params.userId)) {
    return NextResponse.json({error: 'Invalid user ID'}, { status: 400 });
  } else if (!Types.ObjectId.isValid(params.orderId)) {
    return NextResponse.json({error: 'Invalid order ID'}, { status: 400 });
  }
  if (session.user._id !== params.userId) {
    return NextResponse.json({}, { status: 403 });
  }

  // 404: User not found or order not found
  const existingOrder = await getOrder(params.userId, params.orderId);
  if (existingOrder === null) {
    return NextResponse.json({error: 'User or order not found.'}, { status: 404 });
  }

  // 200: Successssssssssssss
  return NextResponse.json(existingOrder);
}