import { apiClient } from './apiClient';

export interface Interest {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: number;
  productTitle: string;
  status: 0 | 1 | 2; // 0=Pending, 1=Accepted, 2=Rejected
  createdAt: string;
}

export const interestService = {
  getForSeller: (page = 1, pageSize = 20) =>
    apiClient.get<{ interests: Interest[]; hasMore: boolean }>(`/interests/seller?page=${page}&pageSize=${pageSize}`),

  updateStatus: (id: string, status: 1 | 2) => {
    const statusStr = status === 1 ? 'Accepted' : 'Rejected';
    return apiClient.patch<{ interest: Interest }>(`/interests/${id}/status?status=${statusStr}`, {});
  },
};
