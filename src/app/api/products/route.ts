import { ProductsResponse, getProducts } from '@/lib/handlers'; 
import { NextRequest, NextResponse } from 'next/server';

export async function GET( 
  request: NextRequest
): Promise<NextResponse<ProductsResponse>> { 
  
  const products = await getProducts();

  // 200: Success.
  return NextResponse.json(products);
}

