// import { savedTooltips } from "../utils/saveTooltip";

// global variable
// let tooltips: { ele: string; content: string; pathName: string }[] | [] = [];

// get saved tooltips only for top window
(async () => {
  if (window.top == window.self) {
    // tooltips = await savedTooltips();
  } else {
    window.top?.postMessage({ type: "tooltip-target" }, "*");
  }
})();
