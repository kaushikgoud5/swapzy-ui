import { apiClient } from './apiClient';
import type { FeedProduct, FeedResponse } from '../types/dto';

export interface SwipeEntry {
  productId: number;
  direction: 0 | 1; // 0 = Like, 1 = Pass
}

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
    return apiClient.get<FeedResponse>(`/feed?${q}`);
  },

  // No lat/lng in body — backend doesn't accept them
  async batchSwipe(swipes: SwipeEntry[]): Promise<void> {
    await apiClient.post<any>('/swipes/batch', { swipes });
  },
};
