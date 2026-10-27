export const CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍜', color: '#f4a340' },
  { key: 'rent', label: 'Rent', emoji: '🏠', color: '#5b5bf0' },
  { key: 'travel', label: 'Travel', emoji: '🚕', color: '#2aa9d6' },
  { key: 'bills', label: 'Bills', emoji: '💡', color: '#e8b923' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#e0559c' },
  { key: 'fun', label: 'Fun', emoji: '🎬', color: '#2fb67c' },
  { key: 'other', label: 'Other', emoji: '🧾', color: '#8a90a6' },
];

export const categoryOf = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
