import { useQuery } from '@tanstack/react-query';
import { productService, contentService, settingService, categoryService } from '../services/api';

// ─── Products ────────────────────────────────────────────────────────────────

export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts().then((r) => r.data),
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id).then((r) => r.data),
    enabled: !!id,
  });

// ─── Content (CMS) ───────────────────────────────────────────────────────────

export const useContent = () =>
  useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const res = await contentService.getContent();
      if (!res.data || res.data.length === 0) throw new Error('Empty');
      return res.data.reduce((acc, item) => {
        acc[item.key_name] = item.value;
        return acc;
      }, {});
    },
    // Gracefully fall back to empty object — pages handle missing keys with defaults
    placeholderData: {},
  });

// ─── Settings ────────────────────────────────────────────────────────────────

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.getSettings().then((r) => r.data ?? {}),
    // Settings rarely change — keep fresh for 10 min
    staleTime: 10 * 60 * 1000,
    placeholderData: { cake_types: [], max_cake_pounds: 10 },
  });

// ─── Categories ──────────────────────────────────────────────────────────────

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories().then((r) => r.data ?? []),
    staleTime: 10 * 60 * 1000,
    placeholderData: [],
  });
