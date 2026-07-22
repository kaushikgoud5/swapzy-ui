import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';

export const CATEGORIES_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => categoryService.getCategories(),
    staleTime: Infinity, // categories never change at runtime
  });
}
