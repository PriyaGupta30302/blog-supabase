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

export async function incrementBlogViews(blogId: string) {
  try {
    const { error } = await adminSupabase.rpc('increment_views', { blog_id: blogId });
    if (error) {
      // Fallback if RPC doesn't exist yet but column does
      const { data: currentBlog, error: fetchError } = await adminSupabase
        .from('blogs')
        .select('views')
        .eq('id', blogId)
        .single();
      
      if (fetchError) throw fetchError;

      const newViews = (currentBlog?.views || 0) + 1;
      await adminSupabase
        .from('blogs')
        .update({ views: newViews })
        .eq('id', blogId);
    }
    return { success: true };
  } catch (error: any) {
    // If column 'views' is missing, error code might be 42703 (undefined_column)
    const isMissingFeature = error.code === '42P01' || 
                           error.code === '42703' ||
                           error.message?.includes('schema cache') || 
                           error.message?.includes('Could not find') ||
                           error.message?.includes('column "views" does not exist');
    
    if (!isMissingFeature) {
      console.error('Increment views failed:', error);
    }
    return { success: false };
  }
}

export async function toggleLikeAction(blogId: string, userId: string) {
  try {
    // Check if liked
    const { data: existingLike, error: fetchError } = await adminSupabase
      .from('blog_likes')
      .select('id')
      .eq('blog_id', blogId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingLike) {
      await adminSupabase.from('blog_likes').delete().eq('id', existingLike.id);
    } else {
      await adminSupabase.from('blog_likes').insert([{ blog_id: blogId, user_id: userId }]);
    }
    
    revalidatePath(`/blog/${blogId}`);
    return { success: true };
  } catch (error: any) {
    const isMissingTable = error.code === '42P01' || 
                         error.message?.includes('schema cache') || 
                         error.message?.includes('Could not find the table');
    
    if (!isMissingTable) {
      console.error('Toggle like failed:', error);
    }
    return { success: false };
  }
}

export async function getBlogLikesCount(blogId: string) {
  try {
    const { count, error } = await adminSupabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('blog_id', blogId);
    
    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    return 0; // Silently fail for missing table
  }
}

export async function checkIfUserLiked(blogId: string, userId: string) {
  try {
    const { data, error } = await adminSupabase
      .from('blog_likes')
      .select('id')
      .eq('blog_id', blogId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error: any) {
    return false; // Silently fail
  }
}

export async function addCommentAction(blogId: string, userId: string, userName: string, content: string) {
  try {
    const { error } = await adminSupabase
      .from('comments')
      .insert([{ 
        blog_id: blogId, 
        user_id: userId, 
        user_name: userName, 
        content 
      }]);
    
    if (error) throw error;
    revalidatePath(`/blog/${blogId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Add comment failed:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCommentAction(commentId: string) {
  try {
    await checkIsAdmin();

    const { error } = await adminSupabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    revalidatePath('/'); // Revalidate broadly to ensure updates show
    return { success: true };
  } catch (error: any) {
    console.error('Delete comment failed:', error);
    return { success: false, error: error.message };
  }
}

export async function getBlogComments(blogId: string) {
  try {
    const { data, error } = await adminSupabase
      .from('comments')
      .select('*')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false });

    if (error) {
      const isMissingTable = error.code === '42P01' || 
                           error.message?.includes('schema cache') || 
                           error.message?.includes('Could not find the table');
      
      if (isMissingTable) {
        return { success: true, data: [] };
      }
      throw error;
    }
    return { success: true, data };
  } catch (error: any) {
    // Only log if it's NOT a missing table error
    const isMissingTable = error.code === '42P01' || 
                         error.message?.includes('schema cache') || 
                         error.message?.includes('Could not find the table');
    
    if (!isMissingTable) {
      console.error('Get comments failed:', error.message || error);
    }
    return { success: false, error: error.message || 'Failed to fetch comments', data: [] };
  }
}

export async function getCategories() {
  try {
    const { data, error } = await adminSupabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      const isMissingTable = error.code === '42P01' || 
                           error.message?.includes('schema cache') || 
                           error.message?.includes('Could not find the table');
      
      if (isMissingTable) {
        return { success: true, data: [] };
      }
      throw error;
    }
    return { success: true, data };
  } catch (error: any) {
    const isMissingTable = error.code === '42P01' || 
                         error.message?.includes('schema cache') || 
                         error.message?.includes('Could not find the table');
    
    if (!isMissingTable) {
      console.error('Get categories failed:', error.message || error);
    }
    return { success: false, error: error.message || 'Failed to fetch categories', data: [] };
  }
}

export async function createCategory(name: string) {
  try {
    await checkIsAdmin();
    const { data, error } = await adminSupabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    console.error('Create category failed:', error);
    return { success: false, error: error.message };
  }
}


