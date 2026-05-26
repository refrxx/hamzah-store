const API_BASE = 'https://api.scalev.com';
const STORE_ID = import.meta.env.PUBLIC_SCALEV_STORE_ID;
const API_KEY = import.meta.env.PUBLIC_SCALEV_API_KEY;

interface ApiOptions {
  method?: string;
  body?: unknown;
  guestToken?: string | null;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, guestToken } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    'X-Store-ID': STORE_ID,
  };

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API error: ${res.status}`);
  }

  return res.json();
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export interface ScalevProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  images?: string[];
  price: number;
  original_price?: number;
  variants?: ScalevVariant[];
  shipping_info?: {
    free_shipping?: boolean;
    cod?: boolean;
    warranty?: boolean;
  };
}

export interface ScalevVariant {
  id: string;
  name: string;
  price?: number;
}

export interface ScalevCart {
  id: string;
  guest_token: string;
  items: ScalevCartItem[];
  subtotal: number;
}

export interface ScalevCartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  name: string;
  image_url: string;
  variant_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ScalevLocation {
  id: string;
  name: string;
}

export interface ScalevShippingOption {
  courier: string;
  service: string;
  cost: number;
  estimation: string;
}

export interface ScalevCheckoutSummary {
  subtotal: number;
  shipping_cost: number;
  total: number;
  items: ScalevCartItem[];
}

export interface ScalevOrder {
  id: string;
  secret_slug: string;
  created_at: string;
  items: ScalevCartItem[];
  subtotal: number;
  shipping_cost: number;
  gross_revenue: number;
  payment_instructions: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  payment_due_at: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export async function getProducts(page = 1, perPage = 20): Promise<PaginatedResponse<ScalevProduct>> {
  return apiFetch<PaginatedResponse<ScalevProduct>>(`/public/items?per_page=${perPage}&page=${page}`);
}

export async function searchProducts(query: string, page = 1, perPage = 20): Promise<PaginatedResponse<ScalevProduct>> {
  return apiFetch<PaginatedResponse<ScalevProduct>>(`/public/items?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`);
}

export async function getProductDetail(slug: string): Promise<ScalevProduct> {
  return apiFetch<ScalevProduct>(`/public/products/${slug}`);
}

export async function getVariantPricing(ids: string[]): Promise<ScalevVariant[]> {
  return apiFetch<ScalevVariant[]>(`/public/variants/pricing?ids=${ids.join(',')}`);
}

export async function getGuestCart(guestToken: string): Promise<ScalevCart> {
  return apiFetch<ScalevCart>('/public/cart', { guestToken });
}

export async function addToCart(
  productId: string,
  quantity: number,
  guestToken: string,
  variantId?: string
): Promise<ScalevCart> {
  return apiFetch<ScalevCart>('/public/cart/items', {
    method: 'POST',
    body: { product_id: productId, quantity, variant_id: variantId },
    guestToken,
  });
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
  guestToken: string
): Promise<ScalevCart> {
  return apiFetch<ScalevCart>(`/public/cart/items/${itemId}`, {
    method: 'PATCH',
    body: { quantity },
    guestToken,
  });
}

export async function removeCartItem(
  itemId: string,
  guestToken: string
): Promise<ScalevCart> {
  return apiFetch<ScalevCart>(`/public/cart/items/${itemId}`, {
    method: 'DELETE',
    guestToken,
  });
}

export async function getProvinces(): Promise<ScalevLocation[]> {
  return apiFetch<ScalevLocation[]>('/public/locations/provinces');
}

export async function getCities(provinceId: string): Promise<ScalevLocation[]> {
  return apiFetch<ScalevLocation[]>(`/public/locations/cities?province_id=${provinceId}`);
}

export async function getSubdistricts(cityId: string): Promise<ScalevLocation[]> {
  return apiFetch<ScalevLocation[]>(`/public/locations/subdistricts?city_id=${cityId}`);
}

export async function getShippingOptions(
  guestToken: string,
  body: {
    address: string;
    province_id: string;
    city_id: string;
    subdistrict_id: string;
    postal_code: string;
  }
): Promise<ScalevShippingOption[]> {
  return apiFetch<ScalevShippingOption[]>('/public/checkout/shipping-options', {
    method: 'POST',
    body,
    guestToken,
  });
}

export async function getCheckoutSummary(
  guestToken: string,
  body: {
    shipping_option: string;
    shipping_cost: number;
  }
): Promise<ScalevCheckoutSummary> {
  return apiFetch<ScalevCheckoutSummary>('/public/checkout/summary', {
    method: 'POST',
    body,
    guestToken,
  });
}

export async function submitCheckout(
  guestToken: string,
  body: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    address: string;
    province_id: string;
    city_id: string;
    subdistrict_id: string;
    postal_code: string;
    shipping_option: string;
    shipping_cost: number;
    payment_method: string;
    notes?: string;
  }
): Promise<ScalevOrder> {
  return apiFetch<ScalevOrder>('/public/checkout', {
    method: 'POST',
    body,
    guestToken,
  });
}

export async function getOrderBySlug(secretSlug: string): Promise<ScalevOrder> {
  return apiFetch<ScalevOrder>(`/public/orders/${secretSlug}`);
}

export async function uploadTransferProof(
  secretSlug: string,
  file: File
): Promise<{ transfer_proof_url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/public/orders/${secretSlug}/transfer-proof-upload`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'X-Store-ID': STORE_ID,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export async function updateOrderTransferProof(
  secretSlug: string,
  transferProofUrl: string
): Promise<ScalevOrder> {
  return apiFetch<ScalevOrder>(`/public/orders/${secretSlug}`, {
    method: 'PATCH',
    body: { transfer_proof_url: transferProofUrl },
  });
}
