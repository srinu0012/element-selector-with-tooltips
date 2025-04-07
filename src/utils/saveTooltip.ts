import { finder } from "@medv/finder";

export const saveTooltip = (target: HTMLElement, content: string) => {
  // Get existing tooltips from localStorage
  const existing = JSON.parse(localStorage.getItem("tooltips")!) || [];
  const uniqueSelector = finder(target);
  existing.push({ ele: uniqueSelector, content, pathName: location.pathname });

  // add new tooltip and store in localStorage
  localStorage.setItem("tooltips", JSON.stringify(existing));
};
