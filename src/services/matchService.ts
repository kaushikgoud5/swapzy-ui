import { apiClient } from './apiClient';
import type { Match, MatchesResponse } from '../types/dto';

export const matchService = {
  async getMatches(page = 1, pageSize = 20): Promise<MatchesResponse> {
    return apiClient.get<MatchesResponse>(`/matches?page=${page}&pageSize=${pageSize}`);
  },

  async getMatch(id: number): Promise<Match> {
    const res = await apiClient.get<{ match: Match }>(`/matches/${id}`);
    return res.match;
  },

  async cancelMatch(id: number): Promise<void> {
    await apiClient.patch<any>(`/matches/${id}/cancel`, {});
  },
};
