import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { notFound, redirect } from 'next/navigation';
import { Session } from 'next-auth';
import {
  CartItemsResponse,
  updateCartItem,
  deleteProduct,
  getCartItems,
} from '@/lib/handlers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Cart() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  const cartItemsData: CartItemsResponse | null = await getCartItems(
    session.user._id
  );

  if (!cartItemsData) {
    notFound();
  }

  const calculateTotalPrice = () => {
    return cartItemsData.cartItems.reduce(
      (total, cartItem) => total + cartItem.qty * cartItem.product.price,
      0
    );
  };

  return (
    <div className='items-left flex flex-col'>
      <h3 className='pb-4 text-3xl font-bold text-gray-900 sm:pb-6 lg:pb-8'>
        My Shopping Cart
      </h3>

      {cartItemsData.cartItems.length === 0 ? (
        <div className='rounded text-center'>
          <span className='rounded text-sm text-gray-400'>
            The cart is empty
          </span>
        </div>
      ) : (
        <>
          <table className='mb-4 w-full rounded'>
            <thead>
              <tr className='rounded bg-gray-200'>
                <th className='rounded py-2 text-left'> PRODUCT NAME </th>
                <th className='rounded py-2 text-left'> QUANTITY </th>
                <th className='rounded py-2 text-left'> PRICE </th>
                <th className='rounded py-2 text-left'> TOTAL </th>
              </tr>
            </thead>
            <tbody>
              {cartItemsData.cartItems.map((cartItem) => (
                <tr
                  key={cartItem.product._id.toString()}
                  className='rounded bg-white'
                >
                  <td className='lg:w-3/5'>
                    <Link href={`/products/${cartItem.product._id}`}>
                      {cartItem.product.name}
                    </Link>
                  </td>
                  <td className='flex items-center space-x-2'>
                    <button className='text-gray rounded bg-gray-300 px-2 py-1'>
                      {' '}
                      -{' '}
                    </button>
                    <span className='text-gray rounded bg-white px-2 py-1'>
                      {' '}
                      {cartItem.qty}
                    </span>
                    <button className='text-gray rounded bg-gray-300 px-2 py-1'>
                      {' '}
                      +{' '}
                    </button>
                    <button className='rounded bg-red-200 px-2 py-1 text-white'>
                      {' '}
                      🗑️{' '}
                    </button>
                  </td>
                  <td>{cartItem.product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                  <td>
                    {(cartItem.qty * cartItem.product.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='mb-4 w-full rounded bg-gray-200 p-4'>
            <span className='text-lg font-bold'>Total:</span>
            <span className='ml-2 text-lg'>
              {calculateTotalPrice().toFixed(2) + ' €'}
            </span>
          </div>
          <div className='text-center'>
            <Link href='/checkout'>
              <button className='rounded bg-gray-800 px-4 py-2 text-white'>
                Checkout
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
