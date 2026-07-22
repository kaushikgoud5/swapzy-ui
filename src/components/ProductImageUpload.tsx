import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2 } from 'lucide-react';
import { imageService, type ProductImage } from '../services/imageService';
import { useToast } from './Toast';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

interface ProductImageUploadProps {
  productId: number;
}

export function ProductImageUpload({ productId }: ProductImageUploadProps) {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState<UploadingImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    imageService.getImages(productId)
      .then(setImages)
      .catch(() => showToast('Failed to load images', 'error'))
      .finally(() => setLoading(false));
  }, [productId]);

  const totalCount = images.length + uploading.length;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileRef.current) fileRef.current.value = '';

    const available = MAX_IMAGES - totalCount;
    if (available <= 0) {
      showToast(`Maximum ${MAX_IMAGES} images allowed`, 'error');
      return;
    }

    const valid = files.slice(0, available).filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        showToast(`${file.name}: unsupported format. Use JPEG, PNG, or WebP`, 'error');
        return false;
      }
      if (file.size > MAX_SIZE) {
        showToast(`${file.name}: exceeds 5MB limit`, 'error');
        return false;
      }
      return true;
    });

    valid.forEach((file) => uploadFile(file));
  };

  const uploadFile = async (file: File) => {
    const id = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    const item: UploadingImage = { id, file, preview, progress: 0 };

    setUploading((prev) => [...prev, item]);

    try {
      // Step 1: Get pre-signed URL
      const { uploadUrl, s3Key } = await imageService.getUploadUrl(productId, file.type);

      // Step 2: Upload to S3 with progress
      await imageService.uploadToS3(uploadUrl, file, file.type, (progress) => {
        setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, progress } : u)));
      });

      // Step 3: Confirm upload
      const saved = await imageService.confirmUpload(productId, s3Key, file.type);

      setImages((prev) => [...prev, saved]);
      setUploading((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      const msg = err?.message || 'Upload failed';
      setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, error: msg } : u)));
      showToast(msg, 'error');
    } finally {
      URL.revokeObjectURL(preview);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await imageService.deleteImage(productId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showToast('Image removed', 'success');
    } catch {
      showToast('Failed to delete image', 'error');
    }
  };

  const removeFailedUpload = (id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-3">Photos ({images.length}/{MAX_IMAGES})</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Existing images */}
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDelete(img.id)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        ))}

        {/* Uploading images */}
        {uploading.map((item) => (
          <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <img src={item.preview} alt="" className="w-full h-full object-cover opacity-50" />
            {item.error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <span className="text-xs text-red-300 text-center px-1">Failed</span>
                <button onClick={() => removeFailedUpload(item.id)} className="text-xs text-white underline mt-1">
                  Remove
                </button>
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-300">
                <div
                  className="h-full bg-purple-500 transition-all duration-200"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}

        {/* Add button */}
        {totalCount < MAX_IMAGES && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-100 transition-colors"
          >
            <Camera className="w-6 h-6 text-purple-500" />
            <span className="text-xs text-purple-600">Add Photo</span>
          </motion.button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
