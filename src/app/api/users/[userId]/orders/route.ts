import { NextRequest, NextResponse } from 'next/server';
import { OrdersResponse, getOrders, getUser, CreateOrderResponse,createOrder} from '@/lib/handlers';
import { Types } from 'mongoose';

// P2
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

/////////////////////////   GET  ///////////////////////////////////
//  CREATE A GET FOR ORDERS

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { userId: string };
  }
): Promise<NextResponse<OrdersResponse | {} >>{

  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({}, { status: 401 });
  }  
  if (!Types.ObjectId.isValid(params.userId)) {
    return NextResponse.json({error: 'Invalid user ID '}, { status: 400 });
  }
  if (session.user._id !== params.userId) {
    return NextResponse.json({}, { status: 403 });
  }

  //Check if the user exists or not.
  const orders = await getOrders(params.userId);
  if (orders === null) {
    return NextResponse.json({error: 'User not found'}, { status: 404 });
  }

  // TODO: Return 200  
  return NextResponse.json(orders);
} 



/////////////////////////   POST  ///////////////////////////////////
// CREATING AN ORDER

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: { userId: string };
  }
): Promise<NextResponse<CreateOrderResponse> | {}> {
  
  const body = await request.json();
  
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({}, { status: 401 });
  }
  if (!Types.ObjectId.isValid(params.userId)) {
    return NextResponse.json({error: 'Invalid user ID.'}, { status: 400 });
  } else if (!body.address || !body.cardHolder || !body.cardNumber) {
  return NextResponse.json({error: 'Invalid request. Request body invalid or incomplete.'}, { status: 400 });
  }
  if (session.user._id !== params.userId) {
    return NextResponse.json({}, { status: 403 });
  }

  const user = await getUser(params.userId);
  if (!user) {
    return NextResponse.json({error: 'User not found'}, { status: 404 });
  }

  // We call the method to create the order.
  const orderId = await createOrder(params.userId,body);
  if(orderId == null){
    return NextResponse.json({error: 'Invalid request. The cart is empty.'}, { status: 400 });
  }

  // Return the orderId. 
  const headers = new Headers();
  headers.append('Location', `/api/orders/${orderId._id}`);
  return NextResponse.json({ _id: orderId._id }, { status: 201, headers: headers });
}