/**
 * Compresses an image if it exceeds a certain size (in bytes).
 * @param {string} base64Str - The original base64 string.
 * @param {number} maxSizeKB - The maximum size in KB.
 * @returns {Promise<string>} - The compressed base64 string.
 */
export const compressImage = (base64Str, maxSizeKB = 500) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate the current size in bytes (approximate)
      const currentSize = (base64Str.length * 3) / 4 / 1024;
      
      if (currentSize <= maxSizeKB) {
        resolve(base64Str);
        return;
      }

      // If too large, start compressing
      let quality = 0.8;
      let dataUrl = base64Str;

      const performCompression = (q) => {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', q);
      };

      // Simple iterative compression
      dataUrl = performCompression(quality);
      let newSize = (dataUrl.length * 3) / 4 / 1024;

      while (newSize > maxSizeKB && quality > 0.1) {
        quality -= 0.1;
        dataUrl = performCompression(quality);
        newSize = (dataUrl.length * 3) / 4 / 1024;
      }

      // If still too large, downscale
      while (newSize > maxSizeKB && (width > 500 || height > 500)) {
        width *= 0.8;
        height *= 0.8;
        dataUrl = performCompression(quality);
        newSize = (dataUrl.length * 3) / 4 / 1024;
      }

      resolve(dataUrl);
    };
    img.onerror = () => resolve(base64Str);
  });
};
