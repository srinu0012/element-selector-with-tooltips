import { scrollParent } from "dom-helpers";
import { updateTooltipPosition } from "./updateTooltipPosition";
import {
  addMutationObserver,
  addResizeObserver,
  addVisibilityObserver,
} from "./observers";

export const createTooltip = (
  targetElement: HTMLElement,
  content: string,
  pathName: string = location.pathname
) => {
  if (!targetElement || pathName != location.pathname) return;

  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "fixed",
    border: "1px solid black",
    color: "black",
    padding: "5px",
    borderRadius: "50%",
    fontSize: "14px",
    whiteSpace: "nowrap",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    backgroundColor: "white",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
    cursor: "pointer",
    zIndex: "9999",
  });

  tooltip.innerHTML = "<span>!</span>";

  // Create hover tooltip
  const hoverTooltip = document.createElement("div");
  Object.assign(hoverTooltip.style, {
    position: "absolute",
    bottom: "120%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "black",
    color: "white",
    padding: "6px 10px",
    borderRadius: "5px",
    fontSize: "12px",
    // whiteSpace: "nowrap",
    opacity: "0",
    transition: "opacity 0.3s ease, transform 0.2s ease",
    pointerEvents: "none",
  });

  hoverTooltip.textContent = content;

  // Small arrow for tooltip
  const arrow = document.createElement("div");
  Object.assign(arrow.style, {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "0",
    height: "0",
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderTop: "6px solid black",
  });

  hoverTooltip.appendChild(arrow);
  tooltip.appendChild(hoverTooltip);

  // Show tooltip on hover
  tooltip.addEventListener("mouseover", () => {
    hoverTooltip.style.opacity = "1";
    hoverTooltip.style.transform = "translateX(-50%) translateY(-5px)";
  });

  // Hide tooltip when mouse leaves
  tooltip.addEventListener("mouseout", () => {
    hoverTooltip.style.opacity = "0";
    hoverTooltip.style.transform = "translateX(-50%) translateY(0px)";
  });

  updateTooltipPosition(targetElement, tooltip);
  document.body.appendChild(tooltip);

  // Handle Summary Expand/Collapse
  let detailsParent = targetElement.closest("details");
  if (detailsParent) {
    detailsParent.addEventListener("toggle", () => {
      updateTooltipPosition(targetElement, tooltip);
      tooltip.style.display = "none";
    });
  }

  // Set visibility observer for this target element based on that tooltip will display or not
  addVisibilityObserver(targetElement, tooltip);

  // Set resize observer to Adjust on Resizing
  addResizeObserver(targetElement, tooltip);

  // Set mutation observer for DOM changes
  addMutationObserver(targetElement, tooltip);

  // Scroll listener for window
  window.addEventListener("scroll", () =>
    updateTooltipPosition(targetElement, tooltip)
  );

  // Scroll listener for static scroll parent element
  scrollParent(targetElement).addEventListener("scroll", () =>
    updateTooltipPosition(targetElement, tooltip)
  );
};
