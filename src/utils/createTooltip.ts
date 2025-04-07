import { scrollParent } from "dom-helpers";

export const createTooltip = (
  targetElement: HTMLElement,
  content: string,
  pathName: string = location.pathname
) => {
  if (!targetElement || pathName != location.pathname) return;

  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "fixed", // Use fixed position for consistent placement
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
    zIndex: "99999999999999999999",
  });

  tooltip.innerHTML = "<p>!</p>";

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
    whiteSpace: "nowrap",
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

  // Function to update tooltip position
  const updateTooltipPosition = () => {
    const rect = targetElement.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      tooltip.style.top = `${rect.top + 5}px`;
      tooltip.style.left = `${rect.left + rect.width + 5}px`;
      tooltip.style.display = "block";
    } else {
      tooltip.style.display = "none";
    }
  };

  updateTooltipPosition();
  document.body.appendChild(tooltip);

  // Handle Summary Expand/Collapse
  let detailsParent = targetElement.closest("details");
  if (detailsParent) {
    detailsParent.addEventListener("toggle", () => {
      setTimeout(updateTooltipPosition, 50); // Update after animation
    });
  }

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        tooltip.style.display = entry.isIntersecting ? "block" : "none";
      });
    },
    { threshold: 0.9 }
  );

  visibilityObserver.observe(targetElement);

  // Resize Observer to Adjust on Resizing
  const resizeObserver = new ResizeObserver(() => {
    updateTooltipPosition();
  });
  resizeObserver.observe(targetElement);

  // Scroll listener for window
  window.addEventListener("scroll", updateTooltipPosition);

  // Scroll listener for static scroll parent element
  scrollParent(targetElement).addEventListener("scroll", updateTooltipPosition);

  const mutation = new MutationObserver(() => {
    updateTooltipPosition();
  });

  mutation.observe(document.body, {
    attributes: true,
    subtree: true,
    childList: true,
  });

  // const observer = new MutationObserver((_mutations) => {
  //   console.log("mutation");
  // });

  // observer.observe(document.body, {
  //   childList: true,
  //   subtree: true,
  //   attributes: true,
  // });

  // for dragable containers
  // targetElement.parentElement?.addEventListener("drag", updateTooltipPosition);
  // targetElement.parentElement?.addEventListener(
  //   "dragover",
  //   updateTooltipPosition
  // );
  // targetElement.parentElement?.addEventListener(
  //   "dragend",
  //   updateTooltipPosition
  // );
  // targetElement.parentElement?.parentElement?.addEventListener(
  //   "drag",
  //   updateTooltipPosition
  // );
  // targetElement.parentElement?.parentElement?.addEventListener(
  //   "dragover",
  //   updateTooltipPosition
  // );
  // targetElement.parentElement?.parentElement?.addEventListener(
  //   "dragend",
  //   updateTooltipPosition
  // );
};
