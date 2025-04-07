import { finder } from "@medv/finder";
import { scrollParent } from "dom-helpers";

// get current tabId
const getCurrentTabId = async () => {
  const tabId = await chrome.runtime.sendMessage({ action: "getTabId" });
  return tabId;
};

console.log("Content script injected", window.location.origin);

// create div for highlighting the elements
const div = document.createElement("div");
Object.assign(div.style, {
  width: "0px",
  height: "0px",
  position: "absolute",
  pointerEvents: "none",
  zIndex: "999",
  transition: "all 0.12s ease",
  border: "1px solid red",
});

document.body.appendChild(div);

// listener for mousemove
const mouseMoveListener = (e: MouseEvent) => {
  const target = e.composedPath()[0] || e.target;

  if (target instanceof HTMLElement) {
    const rect = target.getBoundingClientRect();
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    div.style.top = `${window.scrollY + rect.top}px`;
    div.style.left = `${window.scrollX + rect.left}px`;
    div.style.display = "block";
  }
};

// listner for click event
const clickListner = async (e: MouseEvent) => {
  e.stopPropagation();
  const target = e.target;

  if (target instanceof HTMLElement) {
    const content = prompt("Enter tooltip content");

    if (content) {
      createTooltip(target, content);
      saveTooltip(target, content);
    }
  }

  // Disable listeners after selection
  const tabId = await getCurrentTabId();
  chrome.storage.local.set({ [tabId]: false });
};

// Function to enable the listeners
const enableListeners = () => {
  document.addEventListener("mousemove", mouseMoveListener, { capture: true });
  document.addEventListener("click", clickListner);
  div.style.display = "block";
};

// Function to disable the listeners
const disableListeners = () => {
  document.removeEventListener("mousemove", mouseMoveListener, {
    capture: true,
  });
  document.removeEventListener("click", clickListner);
  div.style.display = "none";
};

// Message listener for disable the highlight box when mouse enter into the Iframe
window.addEventListener("message", (e) => {
  if (e.data.action === "mouseEnteredIframe") {
    div.style.display = "none";
  }
});

// Checking mouse in Iframe window or Top window(main window)
if (window.top !== window.self) {
  // Event for when mouse enter into the Iframe
  window.document.addEventListener("mouseenter", (e) => {
    e.stopPropagation();
    window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
  });

  // Event for when mouse leave the document
  window.document.addEventListener("mouseleave", () => {
    div.style.display = "none";
  });
}

// Enable or Disable the listeners when the changes happen in  extension local storage
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== "local") return;

  const tabId = await getCurrentTabId();

  if (!tabId || (changes[tabId] === undefined && changes[tabId] !== tabId))
    return;
  changes[tabId].newValue ? enableListeners() : disableListeners();
});

// Enable or Disable the listeners for the first time when injected
chrome.storage.local.get(null, async (storageData) => {
  const tabId = await getCurrentTabId();

  if (tabId && storageData[tabId] !== undefined) {
    if (storageData[tabId]) {
      enableListeners();
    } else {
      disableListeners();
    }
  }
});

const createTooltip = (
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

  tooltip.innerHTML = "<p style='margin:0;'>!</p>";

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
      // tooltip.style.display = "block";
    } else {
      tooltip.style.display = "none";
    }
  };

  updateTooltipPosition();
  document.body.appendChild(tooltip);

  // **Handle Summary Expand/Collapse**
  let detailsParent = targetElement.closest("details");
  if (detailsParent) {
    detailsParent.addEventListener("toggle", () => {
      setTimeout(updateTooltipPosition, 50); // Update after animation
    });
  }

  // const mutation = new MutationObserver(() => {
  //   updateTooltipPosition();
  //   console.log("ji");
  // });
  // mutation.observe(document.body, {
  //   childList: true,
  //   attributes: true,
  //   subtree: true,
  // });

  // **Observer for Viewport Visibility**
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

  //  Add scroll listener for parent which has ability of scroll
  // getAllScrollableParents(targetElement).forEach((scrollElement) => {
  //   scrollElement.addEventListener("scroll", updateTooltipPosition);
  // });

  scrollParent(targetElement).addEventListener("scroll", updateTooltipPosition);

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

// function getSmartSelector(element: Element): string {
//   if (!element || !(element instanceof Element)) {
//     throw new Error("Invalid element provided");
//   }

//   // Use ID if it's unique and valid
//   if (
//     element.id &&
//     document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1
//   ) {
//     return `#${CSS.escape(element.id)}`;
//   }

//   // Use class-based selector if possible
//   const classNames = Array.from(element.classList).filter(Boolean);
//   if (classNames.length > 0) {
//     const selector = `${element.tagName.toLowerCase()}.${classNames
//       .map((c) => CSS.escape(c))
//       .join(".")}`;
//     if (document.querySelectorAll(selector).length === 1) {
//       return selector;
//     }
//   }

//   // Build full path selector with nth-of-type
//   const parts: string[] = [];

//   let current: Element | null = element;

//   while (current && current.nodeType === 1 && current !== document.body) {
//     let part = current.tagName.toLowerCase();

//     if (current.id) {
//       part = `#${CSS.escape(current.id)}`;
//       parts.unshift(part);
//       break;
//     }

//     const siblings = Array.from(current.parentElement?.children || []).filter(
//       (sibling) => sibling.tagName === current!.tagName
//     );

//     if (siblings.length > 1) {
//       const index = siblings.indexOf(current) + 1;
//       part += `:nth-of-type(${index})`;
//     }

//     parts.unshift(part);
//     current = current.parentElement;
//   }

//   return parts.join(" > ");
// }

// Save tooltips in local storage
function saveTooltip(target: HTMLElement, content: string) {
  // Get existing tooltips from localStorage
  const existing = JSON.parse(localStorage.getItem("tooltips")!) || [];
  const uniqueSelector = finder(target);
  existing.push({ ele: uniqueSelector, content, pathName: location.pathname });

  // add new tooltip and store in localStorage
  localStorage.setItem("tooltips", JSON.stringify(existing));
}

// Adding stored tooltips to the page when content script injected (first time)
const savedTooltips: { ele: string; content: string; pathName: string }[] =
  JSON.parse(localStorage.getItem("tooltips")!) || [];

savedTooltips.forEach(({ ele, content, pathName }) => {
  const target = document.querySelector(ele);
  if (target) createTooltip(target as HTMLElement, content, pathName);
});

// function for checking element has scroll property
// function isScrollable(el: HTMLElement): boolean {
//   const style = getComputedStyle(el);
//   const overflowY = style.overflowY;
//   const overflowX = style.overflowX;

//   const canScrollY =
//     (overflowY === "auto" || overflowY === "scroll") &&
//     el.scrollHeight > el.clientHeight;

//   const canScrollX =
//     (overflowX === "auto" || overflowX === "scroll") &&
//     el.scrollWidth > el.clientWidth;

//   return canScrollY || canScrollX;
// }

// function for getting scroll elements
// function getAllScrollableParents(targetElement: HTMLElement): HTMLElement[] {
//   const scrollableParents: HTMLElement[] = [];
//   let parent = targetElement.parentElement;

//   while (parent) {
//     if (isScrollable(parent)) {
//       scrollableParents.push(parent);
//     }
//     parent = parent.parentElement;
//   }

//   return scrollableParents;
// }
