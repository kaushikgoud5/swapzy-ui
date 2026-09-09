import { apiClient } from './apiClient';
import type { FeedProduct, FeedResponse } from '../types/dto';

export const feedService = {
  async getFeed(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    page?: number;
    pageSize?: number;
  }): Promise<FeedResponse> {
    const q = new URLSearchParams({
      latitude: String(params.latitude),
      longitude: String(params.longitude),
      radiusKm: String(params.radiusKm ?? 50),
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 20),
    });
    return apiClient.get<FeedResponse>(`/products/nearby?${q}`);
  },

  async expressInterest(productId: number): Promise<void> {
    await apiClient.post<any>('/interests', { productId });
  },
};
