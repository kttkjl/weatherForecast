import React, { useState, useEffect } from "react";
import dayStrings from "../../Utils/dayStrings";
import ForecastItem from "./ForecastItem";
import ForecastsButton from "./ForecastsButton";

const SearchResults = ({ searchResult, isLoading }) => {
  const kelvinOffset = 273;
  let [massagedFC, setMassagedFC] = useState([]);

  useEffect(() => {
    setMassagedFC(massageSearchResult(searchResult));
  }, [searchResult]);

  /**
   * Adds an object with info formatted to the city's timezone
   * to the search results
   *
   * localDateTime : {
   *    date: "1970-01-01",
   *    time: "12 AM",
   *    timeIdx: 0            // Index of weekday, sunday=0
   * }
   *
   * @param {*} searchResult
   */
  const massageSearchResult = searchResult => {
    if (!searchResult.list) return [];
    let arr = searchResult.list.map((item, idx) => {
      return {
        ...item,
        localDateTime: getLocalDateTimeByOffset(
          item.dt,
          searchResult.city.timezone
        )
      };
    });
    return arr;
  };

  return !isLoading && searchResult.city && searchResult.city.name ? (
    <div className="d-flex flex-grow-1 flex-wrap align-content-center align-items-center justify-content-center">
      <section className="now-container d-flex flex-column m-3">
        <p>
          {searchResult.city.name}, {searchResult.city.country}
        </p>
        <div>
          <img
            alt={searchResult.list[0].weather[0].description}
            src={`https://openweathermap.org/img/wn/${searchResult.list[0].weather[0].icon}@2x.png`}
          />
        </div>
        <p>{searchResult.list[0].weather[0].description.toUpperCase()}</p>
        <div>{Math.round(searchResult.list[0].main.temp - kelvinOffset)} C</div>
        <div>
          <span className="text-info">
            {(searchResult.list[0].main.temp_min | 0) - kelvinOffset} C
          </span>
          {` | `}
          <span className="text-danger">
            {(searchResult.list[0].main.temp_max | 0) - kelvinOffset} C
          </span>
        </div>
      </section>
      <br />
      <ForecastsContainer forecasts={massagedFC} />
    </div>
  ) : (
    <div className="d-flex flex-grow-1 align-items-center justify-content-center">
      {searchResult.city ? "LOADING" : "NO CITY"}
    </div>
  );
};

export default SearchResults;

const ForecastsContainer = ({ forecasts }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [daysArr, setDaysArr] = useState([]);

  /**
   * Separates the forecast array into 5 sub arrays corresponding to a weekday
   * The first subarray will be of 24 hours instead of by weekday
   * @param {Array of forecast objects} forecasts
   */
  const populateDaysArray = forecasts => {
    let arr = [];
    let firstTabIdx = forecasts[0].localDateTime.dayIdx;
    let lastIdx = forecasts[0].localDateTime.dayIdx;
    let firstCount = 8;
    let newArr = [];
    forecasts.forEach(item => {
      if (item.localDateTime.dayIdx !== lastIdx) {
        arr.push(newArr);
        newArr = [];
        lastIdx = item.localDateTime.dayIdx;
      }
      newArr.push(item);
      if (firstCount > 0 && lastIdx !== firstTabIdx) arr[0].push(item);
      firstCount--;
    });
    if (newArr.length === 8) arr.push(newArr);
    return arr;
  };

  useEffect(() => {
    setDaysArr(populateDaysArray(forecasts));
  }, [forecasts]);

  const handleDayClick = evt => {
    // console.log(evt.currentTarget.getAttribute("value"));
    setActiveDay(parseInt(evt.currentTarget.getAttribute("value")));
  };

  return (
    <section className="d-flex flex-column align-items-center m-3">
      <div className="forecast-container d-flex m-2">
        {daysArr[activeDay] &&
          daysArr[activeDay].map((item, idx) => {
            return (
              <ForecastItem
                weatherIcon={{
                  alt: item.weather[0].main,
                  url: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`
                }}
                temperature={`${Math.round(item.main.temp) - 273} C`}
                weather={item.weather[0].main}
                time={item.localDateTime.time}
                key={`fcItem-${idx}`}
              />
            );
          })}
      </div>
      {daysArr[0] && (
        <div className="forecast-buttons d-flex justify-content-around btn-group m-2">
          {daysArr.map((day, idx) => {
            return (
              <ForecastsButton
                handleClick={handleDayClick}
                active={activeDay === idx}
                value={idx}
                buttonText={
                  idx === 0
                    ? "24H"
                    : daysArr[idx] &&
                      dayStrings[daysArr[idx][0].localDateTime.dayIdx]
                }
                key={`fcButton-${idx}`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

/**
 * Return the { date, hour, weekday } in the offset's timezone
 * @param {seconds} utcTime
 * @param {seconds} offset
 */
const getLocalDateTimeByOffset = (utcTime, offset) => {
  let d = new Date(utcTime * 1000);
  let utc = d.getTime() + d.getTimezoneOffset() * 60000;
  let nd = new Date(utc + offset * 1000);
  let dayIdx = nd.getDay();
  let dateOptions = {
    hour12: false
  };
  let [date, time] = nd.toLocaleString(undefined, dateOptions).split(", ");

  time = time.replace(":00", "");
  return { date: date, time: time, dayIdx: dayIdx };
};
