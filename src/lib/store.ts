const GUEST_TOKEN_KEY = 'scalev_guest_token';
const CART_COUNT_KEY = 'scalev_cart_count';

export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function setGuestToken(token: string): void {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function removeGuestToken(): void {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}

export function getCartCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem(CART_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

export function setCartCount(count: number): void {
  localStorage.setItem(CART_COUNT_KEY, String(count));
  refreshCartBadge();
}

export function incrementCartCount(by = 1): void {
  const current = getCartCount();
  setCartCount(current + by);
}

export function decrementCartCount(by = 1): void {
  const current = getCartCount();
  setCartCount(Math.max(0, current - by));
}

export function refreshCartBadge(): void {
  if (typeof document === 'undefined') return;
  const count = getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = count > 0 ? String(count) : '';
    el.classList.toggle('hidden', count === 0);
  });
}
