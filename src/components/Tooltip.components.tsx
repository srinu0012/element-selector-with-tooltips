import { Tooltip, Popper } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import { useEffect, useState } from "react";
import {
  addMutationObserver,
  // addMutationObserver,
  addVisibilityObserver,
  isElementTrulyVisible,
} from "../utils/observers";

const CustomTooltip = ({
  target,
  content,
}: {
  target: Element;
  content: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  console.log(anchorEl, "<<<<<<<<anchorel", target);

  useEffect(() => {
    if (target) {
      setAnchorEl(target as HTMLElement);
      addVisibilityObserver(target, setAnchorEl);
      addMutationObserver(target, setAnchorEl);
      window.addEventListener(
        "scroll",
        () => {
          isElementTrulyVisible(target, setAnchorEl);
        },
        { capture: true }
      );
    }
  }, [target]);

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="right"
      style={{ zIndex: 9999 }}
    >
      <Tooltip title={content} arrow placement="right">
        <HelpIcon color="primary" />
      </Tooltip>
    </Popper>
  );
};

export default CustomTooltip;
