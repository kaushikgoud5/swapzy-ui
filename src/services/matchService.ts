import { apiClient } from './apiClient';

export interface MatchItem {
  id: string;
  interestId: string;
  buyerId: string;
  sellerId: string;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  isSwapped: boolean;
  createdOn: string;
}

export const matchService = {
  getMatches: (page = 1, pageSize = 20) =>
    apiClient.get<{ matches: MatchItem[]; hasMore: boolean }>(`/interests/matches?page=${page}&pageSize=${pageSize}`),
  markSold: (productId: number) =>
    apiClient.patch(`/products/${productId}/status?status=Sold`, {}),
};
