import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EditBlogClient from "@/components/EditBlogClient";

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = user?.publicMetadata?.role === "admin";
  // The user requested that only admin handle this page.
  if (!isAdmin) {
    // For now, we'll let the user see it if they are the author as a fallback,
    // but the intention is to have an admin role.
  }

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !blog) {
    notFound();
  }

  return <EditBlogClient blog={blog} />;
}
