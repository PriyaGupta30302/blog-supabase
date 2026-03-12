'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AdminBlogList from "@/components/AdminBlogList";
import CategoryManager from "@/components/CategoryManager";
import PageLoader from "@/components/PageLoader";
import AdminSkeleton from "@/components/AdminSkeleton";
import { isAdmin as checkAdmin } from "@/lib/auth-client-utils";

export default function AdminPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const isAdmin = checkAdmin(user);

  useEffect(() => {
    // Show PageLoader for first 800ms
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);

    async function fetchBlogs() {
      const [result] = await Promise.all([
        supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false }),
        new Promise(resolve => setTimeout(resolve, 1600)) // PageLoader(800) + Skeleton(800)
      ]);

      if (result.data) setBlogs(result.data);
      setLoading(false);
    }

    if (userLoaded) {
      fetchBlogs();
    }

    return () => clearTimeout(timer);
  }, [userLoaded]);

  useEffect(() => {
    if (userLoaded && !user) {
      router.push('/sign-in');
    }
  }, [userLoaded, user, router]);

  if (!userLoaded || initialLoading || (userLoaded && !user)) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Admin <span className="text-primary">Portal</span></h1>
            <p className="text-foreground/50 mt-2 font-medium">Manage all blog posts, edits, and deletions.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                router.push('/admin/create');
              }}
              className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary-hover transition shadow-lg hover:shadow-primary/20 w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Blog
            </button>
          )}
        </div>

        {loading ? (
          <AdminSkeleton />
        ) : (
          <>
            {!isAdmin && (
              <div className="mb-8 p-4 bg-primary-light border-l-4 border-primary text-primary rounded-lg flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">
                  Admin mode is currently simulated. Set `{"{ \"role\": \"admin\" }"}` in your Clerk user metadata to fully lock this page.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AdminBlogList initialBlogs={blogs || []} />
              </div>
              <div className="lg:col-span-1">
                <CategoryManager />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
