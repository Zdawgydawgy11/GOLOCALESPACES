'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';
import { User } from '@/types';
import { APP_NAME } from '@/lib/config/app';

const STAT_CARDS = [
  { label: 'Total Bookings', value: '0', sub: '+0 this month', icon: 'B', color: 'bg-blue-50 text-blue-700' },
  { label: 'Total Earnings', value: '$0', sub: '+$0 this month', icon: '$', color: 'bg-green-50 text-green-700' },
  { label: 'Active Listings', value: '0', sub: '0 pending review', icon: 'L', color: 'bg-purple-50 text-purple-700' },
  { label: 'Messages', value: '0', sub: '0 unread', icon: 'M', color: 'bg-rose-50 text-rose-700' },
];

const QUICK_ACTIONS = [
  { label: 'List New Space', desc: 'Add a property listing', href: '/dashboard/spaces/new', color: 'bg-rose-600 text-white' },
  { label: 'Browse Spaces', desc: 'Find your perfect location', href: '/spaces', color: 'bg-gray-900 text-white' },
  { label: 'Messages', desc: 'View conversations', href: '/dashboard/messages', color: 'bg-white text-gray-700 border border-gray-200' },
  { label: 'My Bookings', desc: 'Track your reservations', href: '/dashboard/my-bookings', color: 'bg-white text-gray-700 border border-gray-200' },
];

const DASH_NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Spaces', href: '/dashboard/my-spaces' },
  { label: 'My Bookings', href: '/dashboard/my-bookings' },
  { label: 'Messages', href: '/dashboard/messages' },
  { label: 'Notifications', href: '/dashboard/notifications' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch {
      console.error('Sign out error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600" />
      </div>
    );
  }

  const firstName = user?.first_name || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 py-3 overflow-x-auto">
            {DASH_NAV.map((nav, i) => (
              <Link
                key={nav.href}
                href={nav.href}
                className={'text-sm font-medium px-1 py-1 border-b-2 whitespace-nowrap transition-colors ' +
                  (i === 0
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800')}
              >
                {nav.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{'Welcome back, ' + firstName + '!'}</h1>
          <p className="text-gray-500">Here is a snapshot of your Market Space activity.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-3 ' + stat.color}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={'p-5 rounded-2xl transition-all hover:shadow-md ' + action.color}
              >
                <p className="font-semibold text-sm mb-1">{action.label}</p>
                <p className="text-xs opacity-70">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/my-bookings" className="text-sm text-rose-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="text-center py-10 text-gray-400">
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm mt-1">Your recent bookings will appear here.</p>
            <Link
              href="/spaces"
              className="mt-4 inline-flex px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-colors"
            >
              Browse spaces
            </Link>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
