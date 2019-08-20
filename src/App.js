import React, { useState, useEffect, useRef } from "react";
import "./bootstrap.min.css";
import "./App.scss";
// const removeAccents = require("remove-accents-diacritics");

const App = () => {
  // const [cityLib, setCityLib] = useState(new Map());
  const [searchResult, setSearchResult] = useState({});
  const [searchCity, setSearchCity] = useState({
    city: "",
    country: ""
  });
  const [loading, setLoading] = useState(false);

  // const loadCityIdLibrary = async () => {
  //   try {
  //     let res = await fetch("/city.list.min.json");
  //     res = await res.json();
  //     let newMap = new Map();
  //     res.forEach(item => {
  //       let formattedKey = removeAccents.remove(item.name);
  //       let formattedItem = {
  //         id: item.id,
  //         // name: item.name.toLowerCase(),
  //         country: item.country
  //       };
  //       if (!newMap.get(formattedKey)) {
  //         newMap.set(formattedKey, []);
  //       }
  //       newMap.get(formattedKey).push(formattedItem);
  //     });
  //     setCityLib(newMap);
  //     console.log("loaded lib");
  //   } catch (e) {
  //     console.error("Cannot load library: ", e);
  //   }
  // };

  const getCityForecast = async (city, country) => {
    let res = {};
    let url = "https://api.openweathermap.org/data/2.5/forecast";
    let qparams = `?q=${city}${
      country ? `,${country}` : ""
    }&APPID=6b52b7b72ca2d5bc83aa19ed1de27ab6`;
    setLoading(true);
    try {
      res = await fetch(url.concat(qparams));
      res = await res.json();
      setSearchResult(res);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error("Cannot get city info", e);
    }
  };

  useEffect(() => {
    // loadCityIdLibrary();
    return () => {};
  }, []);

  return (
    <div className="App">
      <Search getCityForecast={getCityForecast} setSearchCity={setSearchCity} />
      <SearchResults
        // cityLib={cityLib}
        searchResult={searchResult}
        isLoading={loading}
        searchCity={searchCity}
      />
    </div>
  );
};

const Search = ({ getCityForecast, setSearchCity }) => {
  const [searching, setSearching] = useState(true);
  const inputRef = useRef();

  const handleSubmit = evt => {
    evt.preventDefault();
    setSearching(false);
    let [city, country = ""] = inputRef.current.value.split(/[,]+/);

    setSearchCity({ city: city.toLowerCase(), country: country.toLowerCase() });
    getCityForecast(city, country);
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark bg-primary`}
      style={{
        minHeight: searching ? "100vh" : "25px",
        transition: "min-height 0.2s linear"
      }}
    >
      <div
        className={`d-flex flex-grow-1 ${
          searching ? "flex-column" : "flex-row align-items-center"
        }`}
      >
        <a
          className={`navbar-brand ${searching ? "d-none" : "d-sm-none"} `}
          href="/"
        >
          FcN!
        </a>
        <span
          className={`navbar-brand  ${searching ? "" : "d-none d-sm-block"}`}
        >
          ForecastNao!
        </span>
        <form
          onSubmit={handleSubmit}
          className="container form-inline flex-row flex-grow-1 my-2 my-lg-0"
        >
          <input
            ref={inputRef}
            className="form-control col col-xs-auto d-inline-flex flex-grow-1 "
            type="text"
            placeholder="City, Country (eg. ca)"
            onFocus={() => {
              setSearching(true);
            }}
            onBlur={() => {
              setSearching(false);
            }}
          />
          <button
            className="form-control col col-xs-auto btn-secondary d-inline-flex flex-shrink-1 flex-grow-0"
            type="submit"
          >
            <i className="fas fa-search" />
          </button>
        </form>
      </div>
    </nav>
  );
};

const SearchResults = ({ cityLib, searchResult, isLoading, searchCity }) => {
  const kelvinOffset = 273;
  // const suggestedCities = useRef();

  // useEffect(() => {
  //   if (searchCity.country) {
  //     console.log("country exists", searchCity.country);
  //     return;
  //   }
  //   let suggestions = cityLib.get(searchCity.city);
  //   console.log(suggestions ? `sugg tru ${suggestions}` : "sugg false");
  //   if (suggestions) {
  //     suggestedCities.current = suggestions.filter(
  //       city =>
  //         city.name.localeCompare(searchCity.city, "en", {
  //           sensitivity: "base"
  //         }) === 0
  //     );
  //   }
  // }, [cityLib, searchCity]);
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
      {/* {searchResult.city.name ? (
        <div className="suggested-similar d-flex flex-row">
          {suggestedCities.current.length}
          {suggestedCities.current.map((city, idx) => {
            console.log(city.country);
            return (
              <div key={idx}>
                {city.name} {city.country}
              </div>
            );
          })}
        </div>
      ) : null} */}
    </div>
  ) : (
    <div className="d-flex flex-grow-1 align-items-center justify-content-center">
      {searchResult.city ? "LOADING" : "NOTHING YET!"}
    </div>
  );
};

/**
 * Return the hour in the offset's timezone
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

const dayStrings = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thr",
  5: "Fri",
  6: "Sat"
};

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
        time: ""
      }
    }
  ]
};

export default App;
