import { apiClient } from './apiClient';
import type { UpdateProfileDto, OnboardingLocationDto } from '../types/dto';

export interface ProfileResponse {
  profile: {
    userId: string;
    name: string;
    email: string;
    avatarUrl: string;
    displayName: string;
    bio: string;
    location: OnboardingLocationDto;
    preferredCategoryIds: number[];
  };
}

export const profileService = {
  async getProfile() {
    return apiClient.get<ProfileResponse>('/profile');
  },

  async updateProfile(payload: UpdateProfileDto) {
    return apiClient.put<any>('/profile', payload);
  },
};
