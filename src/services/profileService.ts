import { config } from '../config/env';
import { apiClient } from './apiClient';
import type { OnboardingRequestDto, UpdateProfileDto, OnboardingLocationDto } from '../types/dto';

export interface OnboardingStatusResponse {
  onboarding: {
    userId: string;
    isOnboarded: boolean;
    avatarUrl: string;
    displayName: string;
    bio: string;
    location: OnboardingLocationDto;
    preferredCategoryIds: number[];
  };
}

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
  async getOnboardingStatus() {
    return apiClient.get<OnboardingStatusResponse>('/onboarding/status');
  },

  async getProfile() {
    return apiClient.get<ProfileResponse>('/profile');
  },

  async submitOnboarding(payload: OnboardingRequestDto) {
    if (config.isDev) {
      await new Promise((r) => setTimeout(r, 500));
      return payload;
    }
    return apiClient.post<any>('/onboarding', payload);
  },

  async updateProfile(payload: UpdateProfileDto) {
    if (config.isDev) {
      await new Promise((r) => setTimeout(r, 500));
      return payload;
    }
    return apiClient.put<any>('/profile', payload);
  },
};
