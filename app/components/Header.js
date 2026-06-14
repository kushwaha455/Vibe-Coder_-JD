"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuthenticated(Boolean(localStorage.getItem('token')));
    }
  }, [pathname]);

  function handleLogout(e) {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }

  return (
    <header style={{ background: '#0f172a', color: '#f8fafc', padding: '14px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1160, margin: '0 auto' }}>
        <div>
          <Link href="/" style={{ color: '#fff', fontSize: 20, fontWeight: 700, textDecoration: 'none' }}>
            Vibe Task Manager
          </Link>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>Secure dashboard access</p>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ color: pathname === '/' ? '#38bdf8' : '#e2e8f0', textDecoration: 'none', fontWeight: 600 }}>
            Home
          </Link>
          {!isAuthenticated && (
            <Link href="/login" style={{ color: pathname === '/login' ? '#38bdf8' : '#e2e8f0', textDecoration: 'none', fontWeight: 600 }}>
              Login
            </Link>
          )}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                borderRadius: 9999,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
