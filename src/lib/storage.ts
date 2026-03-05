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
    // Extract file path from URL
    // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/blog-images/[filename]
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) return;

    const { error } = await supabase.storage
      .from('blog-images')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting image from storage:', error);
      throw error;
    }
  } catch (err) {
    console.error('Failed to delete image:', err);
  }
}
