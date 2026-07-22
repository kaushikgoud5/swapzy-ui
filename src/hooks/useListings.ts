import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { imageService } from '../services/imageService';
import { useAppSelector } from '../store';
import type { CreateProductDto } from '../types/dto';
import type { ProductListing } from '../services/listingService';

export const LISTINGS_KEY = ['listings'] as const;

function getUserId(user: { id: string } | null, token: string | null): string | null {
  if (user?.id) return user.id;
  if (token) {
    try { return JSON.parse(atob(token.split('.')[1])).sub; } catch { /* invalid */ }
  }
  return null;
}

type ListingsCache = { products: ProductListing[]; imagesMap: Record<number, { id: number; url: string; displayOrder: number }[]> };

export function useListings() {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const userId = getUserId(user, token);

  return useQuery({
    queryKey: [...LISTINGS_KEY, userId],
    queryFn: async () => {
      const products = await listingService.getMyListings(userId!);
      const imagesMap: ListingsCache['imagesMap'] = {};
      await Promise.all(
        products.map(async (p) => {
          try { imagesMap[p.id] = await imageService.getImages(p.id); }
          catch { imagesMap[p.id] = []; }
        })
      );
      return { products, imagesMap } as ListingsCache;
    },
    enabled: !!userId,
    staleTime: 2 * 60_000, // don't refetch images on every window focus
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateProductDto> }) =>
      listingService.updateListing(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTINGS_KEY }),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const images = await imageService.getImages(id).catch(() => []);
      await Promise.all(images.map((img) => imageService.deleteImage(id, img.id).catch(() => {})));
      await listingService.deleteListing(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTINGS_KEY }),
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const userId = getUserId(user, token);
  const cacheKey = [...LISTINGS_KEY, userId];

  return useMutation({
    mutationFn: (id: number) => listingService.toggleAvailability(id),
    // Optimistic update — flip isAvailable + status immediately so filters work without waiting for refetch
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: cacheKey });
      const previous = qc.getQueryData<ListingsCache>(cacheKey);
      qc.setQueryData<ListingsCache>(cacheKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map((p) =>
            p.id === id
              ? { ...p, isAvailable: !p.isAvailable, status: p.isAvailable ? 2 : 0 }
              : p
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(cacheKey, ctx.previous);
    },
  });
}
