const HISTORY_KEY = "qrforge-history";

export function getQRHistory() {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);

    if (!storedHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(storedHistory);

    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch (error) {
    console.error("Failed to load QR history:", error);
    return [];
  }
}

export function saveQRHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addToQRHistory(entry) {
  const currentHistory = getQRHistory();

  const newHistory = [
    entry,
    ...currentHistory.filter(
      (item) => item.payload !== entry.payload
    ),
  ];

  saveQRHistory(newHistory.slice(0, 20));

  return newHistory.slice(0, 20);
}

export function clearQRHistory() {
  localStorage.removeItem(HISTORY_KEY);
}