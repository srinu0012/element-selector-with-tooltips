import { savedTooltips } from "./utils/getSavedTooltips";
import { createTooltip } from "./utils/createTooltip";
import { saveTooltip } from "./utils/saveTooltip";

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

// Create existed tooltips and append for first time
const appendTooltips = async () => {
  const tooltips = await savedTooltips();
  tooltips.forEach(({ ele, content, pathName }) => {
    const target = document.querySelector(ele);
    if (target) createTooltip(target as HTMLElement, content, pathName);
  });
};

appendTooltips();
