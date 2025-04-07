// Function to update tooltip position
export const updateTooltipPosition = (
  targetElement: HTMLElement,
  tooltip: HTMLElement
) => {
  const rect = targetElement.getBoundingClientRect();

  if (rect.width > 0 && rect.height > 0) {
    tooltip.style.top = `${rect.top + 5}px`;
    tooltip.style.left = `${rect.left + rect.width + 5}px`;
  }
};
