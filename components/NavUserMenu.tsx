'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function NavUserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const initials = email.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-neutral-200 hover:shadow-md transition-shadow"
      >
        <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-neutral-200 py-1 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <p className="text-xs text-neutral-500 truncate">{email}</p>
            </div>
            <Link href="/dashboard" onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
              Dashboard
            </Link>
            <Link href="/dashboard/my-bookings" onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
              My bookings
            </Link>
            <Link href="/dashboard/my-spaces" onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
              My spaces
            </Link>
            <Link href="/dashboard/messages" onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
              Messages
            </Link>
            <div className="border-t border-neutral-100 mt-1">
              <button onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
