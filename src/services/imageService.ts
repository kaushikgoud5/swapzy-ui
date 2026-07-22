import { apiClient } from './apiClient';

export interface ProductImage {
  id: number;
  url: string;
  displayOrder: number;
}

interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
}

interface ConfirmImageResponse {
  id: number;
  url: string;
  displayOrder: number;
}

interface ImagesResponse {
  images: ProductImage[];
}

export const imageService = {
  async getUploadUrl(productId: number, contentType: string): Promise<UploadUrlResponse> {
    return apiClient.post<UploadUrlResponse>(
      `/products/${productId}/images/upload-url?contentType=${encodeURIComponent(contentType)}`, {}
    );
  },

  uploadToS3(
    uploadUrl: string,
    file: File,
    contentType: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.withCredentials = false;
      xhr.setRequestHeader('Content-Type', contentType);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 upload failed: ${xhr.status}`)));
      xhr.onerror = () => reject(new Error('Network error during S3 upload'));
      xhr.send(file);
    });
  },

  async confirmUpload(productId: number, s3Key: string, contentType: string): Promise<ConfirmImageResponse> {
    return apiClient.post<ConfirmImageResponse>(`/products/${productId}/images`, { s3Key, contentType });
  },

  async getImages(productId: number): Promise<ProductImage[]> {
    const res = await apiClient.get<ImagesResponse>(`/products/${productId}/images`);
    return res.images || [];
  },

  async deleteImage(productId: number, imageId: number): Promise<void> {
    await apiClient.delete<void>(`/products/${productId}/images/${imageId}`);
  },
};
