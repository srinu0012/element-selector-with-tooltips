export const getCurrentTabId = async (): Promise<number> => {
  const [tab] = await chrome.tabs.query({ active: true });
  return tab.id || -1;
};
