import { apiClient } from './apiClient';

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdOn: string;
}

export const chatService = {
  getMessages: (matchId: string, page = 1, pageSize = 50) =>
    apiClient.get<{ messages: ChatMessage[]; hasMore: boolean }>(
      `/chat/${matchId}/messages?page=${page}&pageSize=${pageSize}`
    ),
  sendMessage: (matchId: string, text: string) =>
    apiClient.post<{ message: ChatMessage }>(`/chat/${matchId}/messages`, { text }),
};
