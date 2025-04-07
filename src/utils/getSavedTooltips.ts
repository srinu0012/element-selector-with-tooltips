type SavedTooltips = {
  ele: string;
  content: string;
  pathName: string;
};

export const savedTooltips: () => Promise<SavedTooltips[]> = async () => {
  const tooltips = await chrome.storage.local.get("tooltips");
  return tooltips.tooltips;
};
