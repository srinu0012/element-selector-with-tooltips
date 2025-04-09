import { useEffect, useState } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";
import { getCurrentTabId } from "../utils/getCurrentTabId";

const ElementSelector = () => {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    getActiveTab();
  });

  // Get the current active tab and update the state and store the value in chrome local
  const getActiveTab = async () => {
    const tabId = await getCurrentTabId();
    if (tabId) {
      chrome.storage.local.get([tabId?.toString() ?? ""], (result) => {
        if (tabId?.toString() && result[tabId?.toString()] !== undefined) {
          setIsOn(result[tabId?.toString()]);
        }
      });
    }
  };

  const handleToggle = async () => {
    const newState = !isOn;
    setIsOn(newState);
    const tabId = await getCurrentTabId();
    if (tabId) {
      chrome.storage.local.set({ [tabId]: newState });
    }
  };

  return (
    <Box>
      <Typography>Element Selector</Typography>
      <FormControlLabel
        control={
          <Switch checked={isOn} onChange={handleToggle} color="success" />
        }
        label={
          <Typography variant="h6" color={isOn ? "primary" : "secondary"}>
            {isOn ? "ON" : "OFF"}
          </Typography>
        }
      />
    </Box>
  );
};

export default ElementSelector;
