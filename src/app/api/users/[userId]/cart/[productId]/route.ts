import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { deleteProduct, DeleteProductResponse, getCartItems, getProduct, getUser, UpdateCartItem, UpdateCartResponse} from '@/lib/handlers';

// P2
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

///////////////////////////////////////////////////////////////////////////
/////////////////////////////// PUT //////////////////////////////////////
// MODIFY THE QTY OF A PRODUCT IN A CART

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: { userId: string; productId: string };
  }
): Promise<NextResponse<UpdateCartResponse> | {}> {

  const body = await request.json();

  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({}, { status: 401 });
  }
  if (!Types.ObjectId.isValid(params.userId)) {
    return NextResponse.json({error: 'Invalid user ID.'}, { status: 400 });
  } else if (!Types.ObjectId.isValid(params.productId)) {
    return NextResponse.json({error: 'Invalid product ID.'}, { status: 400 });
  } else if (body.qty <= 0) {
    return NextResponse.json({error: 'Number of items not greater than 0.'}, { status: 400 });
  }
  if (session.user._id !== params.userId) {
    return NextResponse.json({}, { status: 403 });
  }

  const user = await getUser(params.userId);
  const product = await getProduct(params.productId);
  if (!user ) {
    return NextResponse.json({error: 'User not found'}, { status: 404 });
  } else if (!product) {
    return NextResponse.json({error: 'Product not found'}, { status: 404 });
  }

  //I call the method to update the cart
  const cartItems = await UpdateCartItem(
    params.userId,
    params.productId,
    body.qty
  );
  // I get the cart updated to show it. 
  if(!cartItems){
    return NextResponse.json({error: 'User not found or product not found.'}, { status: 404 });
  }
  const updatedCart = await getCartItems(params.userId);
  //I check if the product its created 
  if(cartItems?.createdOrUpdated){
    return NextResponse.json(updatedCart,{status: 201});
  }; 
 
  //If the product already exists
  return NextResponse.json(updatedCart);
}


///////////////////////////////////////////////////////////////////////////
/////////////////////////////// DELETE ///////////////////////////////////
// DELETE OF A PRODUCT FROM A CART BY THE ID

export async function DELETE(
  request: NextRequest,
  {
    params,
  }:{
    params:{ userId: string, productId : string }
  }
): Promise<NextResponse<DeleteProductResponse> | {}> {
  
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({}, { status: 401 });
  }
  // Check if both of the ids are valid.
  if (!Types.ObjectId.isValid(params.userId)) {
    return NextResponse.json({error: 'Invalid user ID.'}, { status: 400 });
  } else if (!Types.ObjectId.isValid(params.productId)) {
    return NextResponse.json({error: 'Invalid produt ID.'}, { status: 400 });
  }
  if (session.user._id !== params.userId) {
    return NextResponse.json({}, { status: 403 });
  }
  
  // Call deleteProduct to remove the product from the cart.
  const deleted = await deleteProduct(params.userId, params.productId);
  if (deleted === null) {
    return NextResponse.json({error: 'User or product not found.'}, { status: 404 });
  }

  // puesto en handlers
  //const cartItems = await getCartItems(params.userId);

  // Return 200  
  return NextResponse.json(deleted);
}