/** Returns a star string for a numeric rating, e.g. 3 → "★★★☆☆" */
export const getStars = (rating: number): string =>
  '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

/** Returns a dollar-sign string for a price range, e.g. 2 → "$$" */
export const getPriceDisplay = (priceRange: number): string =>
  '$'.repeat(priceRange);

/** Returns up to two uppercase initials from a restaurant name */
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Formats an ISO date string as YYYY/MM/DD */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
};
