'use server';

import { createClient } from '@supabase/supabase-js';
import { checkIsAdmin } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize admin client once
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

export async function deleteBlogAction(blogId: string, imageUrl: string | null) {
  try {
    await checkIsAdmin();

    // 1. Delete image from storage if it exists
    if (imageUrl) {
      const urlWithoutQuery = imageUrl.split('?')[0];
      const urlParts = urlWithoutQuery.split('/');
      const fileName = urlParts[urlParts.length - 1];

      if (fileName) {
        const decodedFileName = decodeURIComponent(fileName);
        await adminSupabase.storage
          .from('blog-images')
          .remove([decodedFileName]);
      }
    }

    // 2. Delete blog record from database
    const { error: dbError } = await adminSupabase
      .from('blogs')
      .delete()
      .eq('id', blogId);

    if (dbError) throw dbError;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Delete action failed:', error);
    return { success: false, error: error.message };
  }
}

export async function archiveBlogImageAction(imageUrl: string) {
  try {
    await checkIsAdmin();

    const urlWithoutQuery = imageUrl.split('?')[0];
    const urlParts = urlWithoutQuery.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) throw new Error('Could not extract filename from URL');

    const decodedFileName = decodeURIComponent(fileName);

    const { data: fileData, error: downloadError } = await adminSupabase.storage
      .from('blog-images')
      .download(decodedFileName);

    if (downloadError) throw downloadError;

    const { error: uploadError } = await adminSupabase.storage
      .from('edit-images')
      .upload(decodedFileName, fileData, { upsert: true });

    if (uploadError) throw uploadError;

    await adminSupabase.storage
      .from('blog-images')
      .remove([decodedFileName]);

    return { success: true };
  } catch (error: any) {
    console.error('Archive action failed:', error);
    return { success: false, error: error.message };
  }
}

export async function saveBlogAction(blogData: any, blogId?: string) {
  try {
    await checkIsAdmin();

    let result;
    if (blogId) {
      result = await adminSupabase
        .from('blogs')
        .update(blogData)
        .eq('id', blogId);
    } else {
      result = await adminSupabase
        .from('blogs')
        .insert([blogData]);
    }

    if (result.error) throw result.error;

    revalidatePath('/admin');
    revalidatePath('/');
    if (blogData.slug) {
      revalidatePath(`/blog/${blogData.slug}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Save blog action failed:', error);
    return { success: false, error: error.message };
  }
}


