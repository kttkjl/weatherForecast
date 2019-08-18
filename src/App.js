import React, { useState, useEffect, useRef } from "react";
import "./bootstrap.min.css";
import "./App.css";

const App = () => {
  const [cityLib, setCityLib] = useState([]);
  const [searchResult, setSearchResult] = useState({
    city: { name: "", id: -1, country: "" }
  });
  const [searchCity, setSearchCity] = useState({
    city: "",
    country: ""
  });
  const [loading, setLoading] = useState(false);

  const loadCityIdLibrary = async () => {
    try {
      let res = await fetch("/city.list.min.json");
      res = await res.json();
      res = res.map(item => {
        return {
          id: item.id,
          name: item.name.toLowerCase(),
          country: item.country
        };
      });
      setCityLib(res);
      console.log("loaded lib");
    } catch (e) {
      console.error("Cannot load library: ", e);
    }
  };

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
        minHeight: searching ? "100vh" : "50px",
        transition: "min-height 0.2s linear"
      }}
    >
      <div
        className={`d-flex flex-grow-1 ${
          searching ? "flex-column" : "flex-row align-items-center"
        }`}
      >
        <a className="navbar-brand" href="/">
          ForecastNow!
        </a>
        <form
          onSubmit={handleSubmit}
          className="form-inline flex-row flex-grow-1 my-2 my-lg-0"
        >
          <input
            ref={inputRef}
            className="form-control col col-xs-auto d-inline-flex flex-grow-1 "
            type="text"
            placeholder="City, Country (optional, eg. US)"
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
  // let suggestedCities = useRef();

  // useEffect(() => {
  //   if (searchCity.country) {
  //     console.log("country exists", searchCity.country);
  //     return;
  //   }
  //   suggestedCities.current = cityLib.filter(
  //     city =>
  //       city.name.localeCompare(searchCity.city, "en", {
  //         sensitivity: "base"
  //       }) === 0
  //   );
  // }, [cityLib, searchCity]);

  return !isLoading ? (
    <div className="d-flex flex-grow-1 align-items-center justify-content-center">
      <section className="d-flex result-container ">
        <p>
          {searchResult.city.name}, {searchResult.city.country}
        </p>
      </section>
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
    <div>LOADING</div>
  );
};

export default App;
