import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import type { UpdateProfileDto } from '../types/dto';

export const PROFILE_KEY = ['profile'] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileDto) => profileService.updateProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}
