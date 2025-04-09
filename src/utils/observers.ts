import { updateTooltipPosition } from "./updateTooltipPosition";

// Intersection observer to display the tooltip or not
export const addVisibilityObserver = (
  target: Element,
  setAnchorEl: React.Dispatch<React.SetStateAction<Element | null>>
) => {
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.isIntersecting ? setAnchorEl(target) : setAnchorEl(null);
      });
    },
    { threshold: 0.9 }
  );
  visibilityObserver.observe(target);
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
  targetElement: Element,
  setAnchorEl: React.Dispatch<React.SetStateAction<Element | null>>
) => {
  const mutation = new MutationObserver((_entries) => {
    mutation.disconnect();

    isElementTrulyVisible(targetElement, setAnchorEl);

    mutation.observe(document.body, {
      attributes: true,
      subtree: true,
      childList: true,
    });
  });

  mutation.observe(document.body, {
    attributes: true,
    subtree: true,
    childList: true,
  });
};

export const isElementTrulyVisible = (
  target: Element,
  setAnchorEl: React.Dispatch<React.SetStateAction<Element | null>>
) => {
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const topElement = document.elementFromPoint(centerX, centerY);

  // Check if the top element is the target or contains the target
  if (target === topElement || target.contains(topElement)) {
    setAnchorEl(target);
  } else {
    setAnchorEl(null);
  }
};

export const observeDomChanges = (
  target: Element,
  setAnchorEl: React.Dispatch<React.SetStateAction<Element | null>>
) => {
  const observer = new MutationObserver(() => {
    isElementTrulyVisible(target, setAnchorEl);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};
