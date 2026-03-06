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

export async function archiveBlogImageAction(imageUrl: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Extract filename from URL
    const urlWithoutQuery = imageUrl.split('?')[0];
    const urlParts = urlWithoutQuery.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      throw new Error('Could not extract filename from URL');
    }

    const decodedFileName = decodeURIComponent(fileName);
    console.log('Archiving image:', decodedFileName);

    // 2. Download from 'blog-images'
    const { data: fileData, error: downloadError } = await adminSupabase.storage
      .from('blog-images')
      .download(decodedFileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw downloadError;
    }

    // 3. Upload to 'edit-images'
    const { error: uploadError } = await adminSupabase.storage
      .from('edit-images')
      .upload(decodedFileName, fileData, {
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload to archive error:', uploadError);
      throw uploadError;
    }

    // 4. Delete from 'blog-images'
    const { error: deleteError } = await adminSupabase.storage
      .from('blog-images')
      .remove([decodedFileName]);

    if (deleteError) {
      console.error('Delete from original error:', deleteError);
      // We don't throw here because archiving was successful, but log it
    }

    console.log('Successfully archived image to edit-images');
    return { success: true };
  } catch (error: any) {
    console.error('Archive action failed:', error);
    return { success: false, error: error.message };
  }
}
