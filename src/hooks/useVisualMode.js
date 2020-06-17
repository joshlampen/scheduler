import React, { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace = false) => {
    if (replace) {
      setMode(newMode);
      history[history.length - 1] = newMode;
    } else {
      setMode(newMode);
      setHistory(prev => ([...prev, newMode]));
    }
  };

  const back = () => {
    if (history.length === 1) return;

    history.pop();
    setMode(history[history.length - 1]);
  };

  return { mode, transition, back };
}