import { finder } from "@medv/finder";

type SavedTooltips = {
  ele: string;
  content: string;
  pathName: string;
};

// Get saved tooltips from the extension storage
export const savedTooltips: () => Promise<SavedTooltips[]> = async () => {
  const tooltips = await chrome.storage.local.get("tooltips");
  return tooltips.tooltips;
};

// Set saved tooltips from the extension storage
export const saveTooltip: (
  target: HTMLElement,
  content: string
) => Promise<void> = async (target: HTMLElement, content: string) => {
  // Get existing tooltips from extension local Storage
  const { tooltips } = await chrome.storage.local.get("tooltips");
  const uniqueSelector = finder(target);
  tooltips.push({ ele: uniqueSelector, content, pathName: location.pathname });

  // add new tooltip and store in extension local Storage
  chrome.storage.local.set({ tooltips: tooltips });
};
