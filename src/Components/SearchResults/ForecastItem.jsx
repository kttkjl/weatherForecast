import React from "react";

/**
 * Display component, only cares about props given
 * @param {} param0
 */
const ForecastItem = ({ weatherIcon, temperature, weather, time }) => {
  return (
    <div className="forecast-item d-flex flex-column align-items-center px-2">
      <img alt={weatherIcon.alt} src={weatherIcon.url} />
      <div>{temperature}</div>
      <div>{weather}</div>
      <div>{time}</div>
    </div>
  );
};

export default ForecastItem;
