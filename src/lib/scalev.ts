const API_BASE = 'https://api.scalev.com';
const STORE_ID = import.meta.env.PUBLIC_SCALEV_STORE_ID;
const API_KEY = import.meta.env.PUBLIC_SCALEV_API_KEY;

async function scalevFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Scalev-Storefront-Api-Key', API_KEY);

  const guestToken = localStorage.getItem('scalev_guest_token');
  if (guestToken) headers.set('X-Scalev-Guest-Token', guestToken);

  const res = await fetch(`${API_BASE}/v3/stores/${STORE_ID}${path}`, {
    ...init,
    credentials: 'omit',
    headers,
  });

  const newToken = res.headers.get('x-scalev-guest-token');
  if (newToken) localStorage.setItem('scalev_guest_token', newToken);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Scalev error body:', JSON.stringify(err, null, 2));
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export const getProducts = (params: { per_page?: number; page?: number; search?: string } = {}) => {
  const q = new URLSearchParams({
    per_page: String(params.per_page || 20),
    page: String(params.page || 1),
    ...(params.search ? { search: params.search } : {}),
  });
  return scalevFetch(`/public/items?${q}`);
};

export const getProductDetail = (slug: string) =>
  scalevFetch(`/public/products/${slug}`);

export const getBundlePriceOption = (slug: string) =>
  scalevFetch(`/public/bundle-price-options/${slug}`);

export const getGuestCart = () => scalevFetch('/public/cart');

export const addToCart = (id: number, quantity = 1, type: 'variant' | 'bundle_price_option' = 'variant') =>
  scalevFetch('/public/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      type === 'bundle_price_option'
        ? { type: 'bundle_price_option', bundle_price_option_id: id, quantity }
        : { type: 'variant', variant_id: id, quantity }
    ),
  });

export const updateCartItem = (itemId: number, quantity: number) =>
  scalevFetch(`/public/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (itemId: number) =>
  scalevFetch(`/public/cart/items/${itemId}`, { method: 'DELETE' });

export const getProvinces = () => scalevFetch('/public/locations/provinces');
export const getCities = (provinceId: number) =>
  scalevFetch(`/public/locations/cities?province_id=${provinceId}`);
export const getSubdistricts = (cityId: number) =>
  scalevFetch(`/public/locations/subdistricts?city_id=${cityId}`);

export const getShippingOptions = (payload: object) =>
  scalevFetch('/public/checkout/shipping-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const getCheckoutSummary = (payload: object) =>
  scalevFetch('/public/checkout/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const submitCheckout = (payload: object) =>
  scalevFetch('/public/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const getOrderBySlug = (secretSlug: string) =>
  scalevFetch(`/public/orders/${secretSlug}`);

export const uploadTransferProof = async (secretSlug: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();
  headers.set('X-Scalev-Storefront-Api-Key', API_KEY);
  const guestToken = localStorage.getItem('scalev_guest_token');
  if (guestToken) headers.set('X-Scalev-Guest-Token', guestToken);

  const res = await fetch(
    `${API_BASE}/v3/stores/${STORE_ID}/public/orders/${secretSlug}/transfer-proof-upload`,
    { method: 'POST', credentials: 'omit', headers, body: formData }
  );
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
};

export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

export const refreshCartBadge = async () => {
  try {
    const cart = await getGuestCart();
    const total = (cart.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = String(total);
      (el as HTMLElement).style.display = total === 0 ? 'none' : 'flex';
    });
    localStorage.setItem('scalev_cart_count', String(total));
    return total;
  } catch {
    return 0;
  }
};
