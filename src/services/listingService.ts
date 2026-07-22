import { apiClient } from './apiClient';
import type { CreateProductDto, CreateProductLocationDto } from '../types/dto';

export interface ProductListing {
  id: number;
  ownerId: string;
  name: string;
  description: string;
  condition: string;
  productCategoryId: number;
  estimatedValue: number;
  originalValue: number;
  status: number;
  isAvailable: boolean;
  isActive: boolean;
  location: CreateProductLocationDto & { latitude: number; longitude: number };
  createdOn: string;
  modifiedOn: string | null;
}

interface ProductsResponse {
  products: ProductListing[];
}

export const listingService = {
  async createListing(payload: CreateProductDto) {
    return apiClient.post<any>('/products', payload);
  },

  async getMyListings(ownerId: string): Promise<ProductListing[]> {
    const res = await apiClient.get<ProductsResponse>(`/products?ownerId=${ownerId}`);
    return res?.products || [];
  },

  async updateListing(id: number, payload: Partial<CreateProductDto>) {
    return apiClient.put<any>(`/products/${id}`, payload);
  },

  async deleteListing(id: number) {
    return apiClient.delete<any>(`/products/${id}`);
  },

  async toggleAvailability(id: number) {
    return apiClient.patch<any>(`/products/${id}/toggle-availability`, {});
  },
};
