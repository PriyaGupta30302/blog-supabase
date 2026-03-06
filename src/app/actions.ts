'use server';

import { createClient } from '@supabase/supabase-js';

export async function deleteBlogAction(blogId: string, imageUrl: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
  }

  // Initialize admin client with service role key to bypass RLS
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Delete image from storage if it exists
    if (imageUrl) {
      const urlWithoutQuery = imageUrl.split('?')[0];
      const urlParts = urlWithoutQuery.split('/');
      const fileName = urlParts[urlParts.length - 1];

      if (fileName) {
        const decodedFileName = decodeURIComponent(fileName);
        console.log('Admin deleting image:', decodedFileName);
        
        const { error: storageError } = await adminSupabase.storage
          .from('blog-images')
          .remove([decodedFileName]);

        if (storageError) {
          console.error('Admin storage cleanup error:', storageError);
          // We continue anyway to delete the database record, but log the error
        } else {
          console.log('Successfully deleted image from storage');
        }
      }
    }

    // 2. Delete blog record from database
    const { error: dbError } = await adminSupabase
      .from('blogs')
      .delete()
      .eq('id', blogId);

    if (dbError) {
      throw dbError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete action failed:', error);
    return { success: false, error: error.message };
  }
}
