"use client";

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseSession } from '@/hooks/use-supabase-session';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { session, loading } = useSupabaseSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (session) {
        // User is logged in
        if (location.pathname === '/login') {
          navigate('/'); // Redirect from login page to home if already logged in
        }
      } else {
        // User is not logged in
        if (location.pathname !== '/login') {
          navigate('/login'); // Redirect to login page if not logged in and not already on login
        }
      }
    }
  }, [session, loading, navigate, location.pathname]);

  if (loading) {
    // Show a loading skeleton or spinner while session is being fetched
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }

  // Render children only if session is loaded and user is on the correct page
  // Or if user is on login page and not logged in (to show the auth UI)
  if ((session && location.pathname !== '/login') || (!session && location.pathname === '/login')) {
    return <>{children}</>;
  }

  // If not loading, and not on the correct page (e.g., logged out user on a protected page,
  // or logged in user on login page, waiting for redirect to take effect),
  // we render nothing or a small loading indicator.
  return null;
};

export default SessionProvider;