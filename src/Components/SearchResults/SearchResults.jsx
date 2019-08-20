import React, { useState, useEffect } from "react";
import dayStrings from "../../Utils/dayStrings";

const SearchResults = ({ searchResult, isLoading }) => {
  const kelvinOffset = 273;
  let [massagedFC, setMassagedFC] = useState([]);

  useEffect(() => {
    setMassagedFC(massageSearchResult(searchResult));
  }, [searchResult]);

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
            src={`https://openweathermap.org/img/wn/${
              searchResult.list[0].weather[0].icon
            }@2x.png`}
          />
        </div>
        <p>{searchResult.list[0].weather[0].description.toUpperCase()}</p>
        <div>
          <span className="text-info">
            {(searchResult.list[0].main.temp_min | 0) - kelvinOffset} C
          </span>
          |
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
      {searchResult.city ? "LOADING" : "NOTHING YET!"}
    </div>
  );
};

export default SearchResults;

const ForecastsContainer = ({ forecasts }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [daysArr, setDaysArr] = useState([]);

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
    setActiveDay(evt.currentTarget.getAttribute("value"));
  };

  return (
    <section className="d-flex flex-column align-items-center m-3">
      <div className="forecast-container d-flex m-2">
        {daysArr[activeDay] &&
          daysArr[activeDay].map((item, idx) => {
            return (
              <div
                className="forecast-item d-flex flex-column align-items-center px-2"
                key={idx}
              >
                <img
                  alt={item.weather[0].main}
                  src={`https://openweathermap.org/img/wn/${
                    item.weather[0].icon
                  }.png`}
                />
                <div>{Math.round(item.main.temp) - 273} C</div>
                <div>{item.weather[0].main}</div>
                <div>{item.localDateTime.time}</div>
              </div>
            );
          })}
      </div>
      {daysArr[0] && (
        <div className="forecast-buttons d-flex justify-content-around btn-group m-2">
          <button
            onClick={handleDayClick}
            className={`p-1 btn btn-primary ${
              activeDay === "0" ? "active" : ""
            }`}
            value={0}
          >
            24H
          </button>
          <button
            onClick={handleDayClick}
            className={`p-1 btn btn-primary ${
              activeDay === "1" ? "active" : ""
            }`}
            value={1}
          >
            {daysArr[1] && dayStrings[daysArr[1][0].localDateTime.dayIdx]}
          </button>
          <button
            onClick={handleDayClick}
            className={`p-1 btn btn-primary ${
              activeDay === "2" ? "active" : ""
            }`}
            value={2}
          >
            {daysArr[2] && dayStrings[daysArr[2][0].localDateTime.dayIdx]}
          </button>
          <button
            onClick={handleDayClick}
            className={`p-1 btn btn-primary ${
              activeDay === "3" ? "active" : ""
            }`}
            value={3}
          >
            {daysArr[3] && dayStrings[daysArr[3][0].localDateTime.dayIdx]}
          </button>
          <button
            onClick={handleDayClick}
            className={`p-1 btn btn-primary ${
              activeDay === "4" ? "active" : ""
            }`}
            value={4}
          >
            {daysArr[4] && dayStrings[daysArr[4][0].localDateTime.dayIdx]}
          </button>
        </div>
      )}
    </section>
  );
};
ForecastsContainer.defaultProps = {
  forecasts: [
    {
      dt: 0,
      weather: [{ id: -1, main: "Stub", icon: "01n" }],
      main: {
        temp: 50,
        temp_max: 100,
        temp_min: -100
      },
      localDateTime: {
        date: "",
        time: "",
        dayIdx: 0
      }
    }
  ]
};

/**
 * Return the date, hour, day in the offset's timezone
 * @param {seconds} utcTime
 * @param {seconds} offset
 */
const getLocalDateTimeByOffset = (utcTime, offset) => {
  let d = new Date(utcTime * 1000);
  let utc = d.getTime() + d.getTimezoneOffset() * 60000;
  let nd = new Date(utc + offset * 1000);
  let dayIdx = nd.getDay();
  let [date, time] = nd.toLocaleString().split(", ");
  time = time.replace(":00:00", "");
  return { date: date, time: time, dayIdx: dayIdx };
};
