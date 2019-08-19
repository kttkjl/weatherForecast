import React, { useState, useEffect, useRef } from "react";
import "./bootstrap.min.css";
import "./App.scss";
// const removeAccents = require("remove-accents-diacritics");

const App = () => {
  const [cityLib, setCityLib] = useState(new Map());
  const [searchResult, setSearchResult] = useState({
    city: { name: "", id: -1, country: "" }
  });
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
      console.log(res);
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
        cityLib={cityLib}
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
    <div className="d-flex flex-grow-1 flex-column align-items-center justify-content-center">
      <section className="now-container d-flex flex-column">
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
      <p> Next 24 hours </p>
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
      NOTHING YET!
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
  const [days, setDays] = useState([]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  useEffect(() => {}, [forecasts]);

  return (
    <section className="forecast-container d-flex">
      {forecasts.map((item, idx) => {
        if (idx > 8) return null;
        return (
          <div
            className="forecast-item d-flex flex-column align-items-center px-1"
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

// const NextDaysForecast = ({forecasts}) => {

// }
// NextDaysForecast.defaultProps = {
//   forecasts: [
//     "1970-01-01" : {

//     }
//   ]
// };

export default App;
