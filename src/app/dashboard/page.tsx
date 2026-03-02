import Header from "@/components/Header";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import ClientDashboard from "@/components/ClientDashboard";

export default async function DashboardPage() {
  const user = await currentUser();
  
  // Fetch blogs from Supabase
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <ClientDashboard user={user} initialBlogs={blogs || []} />
    </div>
  );
}
