const CLICKABLE_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], [role="checkbox"], label, summary, .cursor-pointer, [onclick]';

const TEXT_SELECTOR =
  'p, h1, h2, h3, h4, h5, h6, span, label, li, blockquote, code, pre';

const CLICKABLE_CACHE = new WeakMap<Element, boolean>();
const TEXT_CACHE = new WeakMap<Element, boolean>();

/**
 * Checks if an element or its ancestors are clickable using native closest() with WeakMap memoization.
 */
export function checkClickable(target: HTMLElement | null): boolean {
  if (!target) return false;
  const cached = CLICKABLE_CACHE.get(target);

  if (cached !== undefined) return cached;

  const isClick = target.closest(CLICKABLE_SELECTOR) !== null;
  CLICKABLE_CACHE.set(target, isClick);

  return isClick;
}

/**
 * Checks if the element is textual content suitable for cursor tilt effect.
 */
export function checkHoveringText(target: HTMLElement | null, isClickable: boolean): boolean {
  if (!target || isClickable) return false;
  const cached = TEXT_CACHE.get(target);

  if (cached !== undefined) return cached;

  const isText = target.closest(TEXT_SELECTOR) !== null;
  TEXT_CACHE.set(target, isText);

  return isText;
}

