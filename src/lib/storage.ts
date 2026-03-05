import { supabase } from './supabase';

export async function uploadBlogImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteBlogImage(imageUrl: string) {
  try {
    // Handle potential query parameters and decode URL encoded characters
    const urlWithoutQuery = imageUrl.split('?')[0];
    const urlParts = urlWithoutQuery.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      console.warn('Could not extract filename from URL:', imageUrl);
      return;
    }

    // Decode filename in case it's URL-encoded (common for spaces/special chars)
    const decodedFileName = decodeURIComponent(fileName);
    console.log('Attempting to delete image from Supabase:', decodedFileName);

    const { data, error } = await supabase.storage
      .from('blog-images')
      .remove([decodedFileName]);

    if (error) {
      console.error('Supabase Storage cleanup error:', error);
      throw error;
    }

    if (data && data.length === 0) {
      console.warn('File not found in bucket or RLS permission denied for:', decodedFileName);
    } else {
      console.log('Successfully deleted image:', decodedFileName);
    }
  } catch (err: any) {
    console.error('Delete operation failed:', err);
    throw new Error(`Failed to clean up image: ${err.message || 'Unknown error'}`);
  }
}
