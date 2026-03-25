import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import { APP_NAME } from '@/lib/config/app';
import { NavUserMenu } from './NavUserMenu';

export async function Navbar() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-neutral-900 tracking-tight shrink-0">
          {APP_NAME}
        </Link>

        {/* Center nav */}
        <div className="hidden sm:flex items-center gap-1">
          <Link href="/spaces" className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
            Browse spaces
          </Link>
          <Link href="/list-space" className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
            List a space
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <NavUserMenu email={user.email ?? ''} />
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
