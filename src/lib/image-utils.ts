/**
 * Converts an image file to WebP format using HTML5 Canvas.
 * @param file The original image file (JPEG, PNG, etc.)
 * @param quality The quality of the output WebP (0 to 1)
 * @returns A promise that resolves to a new File object in WebP format
 */
export async function convertToWebP(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            
            // Create a new file from the blob
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const newFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            
            resolve(newFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image loading failed'));
    };
    reader.onerror = () => reject(new Error('File reading failed'));
  });
}

