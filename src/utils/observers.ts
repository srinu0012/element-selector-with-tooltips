import { updateTooltipPosition } from "./updateTooltipPosition";

// Intersection observer to display the tooltip or not
export const addVisibilityObserver = (
  targetElement: HTMLElement,
  tooltip: HTMLElement
) => {
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        tooltip.style.display = entry.isIntersecting ? "block" : "none";
      });
    },
    { threshold: 0.9 }
  );
  visibilityObserver.observe(targetElement);
};

// Resize Observer to Adjust on Resizing
export const addResizeObserver = (
  targetElement: HTMLElement,
  tooltip: HTMLElement
) => {
  const resizeObserver = new ResizeObserver(() => {
    updateTooltipPosition(targetElement, tooltip);
  });
  resizeObserver.observe(targetElement);
};

// Mutation Observer for DOM changes
export const addMutationObserver = (
  targetElement: HTMLElement,
  tooltip: HTMLElement
) => {
  const mutation = new MutationObserver(() => {
    console.log("<<<<<<<<<mutation");
    updateTooltipPosition(targetElement, tooltip);
  });

  mutation.observe(document.body, {
    attributes: true,
    subtree: true,
    childList: true,
  });
};
