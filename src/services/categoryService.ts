import { apiClient } from './apiClient';

export interface Category {
  id: number | string;
  label: string;
  icon: string;
  gradient: string;
  imageUrl?: string;
}

function normalizeCategory(raw: any, index: number): Category {
  return {
    id: raw.id || raw._id || raw.categoryId || `cat-${index}`,
    label: raw.label || raw.name || raw.title || '',
    icon: raw.icon || '',
    gradient: raw.gradient || raw.color || 'from-purple-500 to-purple-600',
    imageUrl: raw.imageUrl || raw.image || raw.img || '',
  };
}

function extractArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.categories && Array.isArray(res.categories)) return res.categories;
  return [];
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<any>('/categories');
    const raw = extractArray(res);
    return raw.map(normalizeCategory);
  },
};
