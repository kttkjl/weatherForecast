import React from "react";

/**
 * Display component, only cares about props given
 * @param {} param0
 */
const ForecastsButton = ({ handleClick, active, value, buttonText }) => {
  return (
    <button
      onClick={handleClick}
      className={`p-1 btn btn-primary ${active ? "active" : ""}`}
      value={value}
    >
      {buttonText}
    </button>
  );
};

export default ForecastsButton;
