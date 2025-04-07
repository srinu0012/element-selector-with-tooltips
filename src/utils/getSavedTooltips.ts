type SavedTooltips = {
  ele: string;
  content: string;
  pathName: string;
};

export const savedTooltips: () => SavedTooltips[] | [] = () =>
  JSON.parse(localStorage.getItem("tooltips")!) || [];
