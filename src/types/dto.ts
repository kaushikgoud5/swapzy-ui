// ─── Location DTOs ───

export interface OnboardingLocationDto {
  country: string;
  state: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateProductLocationDto {
  country: string;
  state: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

// ─── Profile ───

export interface UpdateProfileDto {
  avatarUrl?: string;
  displayName?: string;
  bio?: string;
  location?: OnboardingLocationDto;
  preferredCategoryIds?: number[] | null;
}

// ─── Product / Listing ───

export interface CreateProductDto {
  name: string;
  description?: string;
  condition: string;
  productCategoryId: number;
  estimatedValue?: number;
  originalValue?: number;
  location?: CreateProductLocationDto;
}

// ─── Feed ───

export interface FeedProductImage {
  id: number;
  url: string;
  displayOrder: number;
}

export interface FeedProduct {
  id: number;
  ownerId: string;
  name: string;
  description: string | null;
  condition: string;
  productCategoryId: number;
  estimatedValue: number;
  status: number;
  isAvailable: boolean;
  distanceKm: number;
  createdOn: string;
  images: FeedProductImage[];
  location: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  } | null;
}

export interface FeedResponse {
  products: FeedProduct[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Matches ───

// MatchStatus enum: 0=Active, 1=Cancelled, 2=Sold
export type MatchStatus = 0 | 1 | 2;
export const MatchStatusLabel: Record<MatchStatus, string> = { 0: 'Active', 1: 'Cancelled', 2: 'Sold' };

export interface Match {
  id: number;
  interestedUserId: string;
  sellerId: string;
  productId: number;
  productName: string;
  estimatedValue: number;
  status: MatchStatus;
  createdOn: string;
  cancelledAt: string | null;
}

export interface MatchesResponse {
  matches: Match[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}
