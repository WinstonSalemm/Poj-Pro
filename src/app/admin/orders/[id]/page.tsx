'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession, SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  createdAt: string;
};

type Order = {
  id: string;
  total: number;
  status: string;
  customerName: string;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

function OrderDetailsInner() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && !session.user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session.user?.isAdmin) {
      fetchOrder();
    }
  }, [id, status, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'Order not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="text-white hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Order #{order.id.substring(0, 8).toUpperCase()}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              order.status === 'PROCESSING' ? 'bg-[#660000] text-white' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.customerName} ({order.email})
                {order.phone && ` • ${order.phone}`}
              </dd>
            </div>
            {order.address && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.address}
                </dd>
              </div>
            )}
            {order.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Order Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Items
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {item.productId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  Subtotal
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  ${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  Shipping
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  $0.00
                </td>
              </tr>
              <tr className="border-t border-gray-200">
                <td colSpan={3} className="px-6 py-4 text-right text-base font-medium text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 text-right text-base font-bold text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetails() {
  return (
    <SessionProvider>
      <OrderDetailsInner />
    </SessionProvider>
  );
}
