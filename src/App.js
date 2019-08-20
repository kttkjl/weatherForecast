import React, { useState } from "react";
import "./bootstrap.min.css";
import "./App.scss";
import Search from "./Components/Search/Search";
import SearchResults from "./Components/SearchResults/SearchResults";

const App = () => {
  const [searchResult, setSearchResult] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * API call to OpenWeatherMap.org to get 5day/3hour forecast
   * @param {City to be searched} city
   * @param {Country code ISO-3166} country
   */
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

  return (
    <div className="App table-info">
      <Search getCityForecast={getCityForecast} />
      <SearchResults searchResult={searchResult} isLoading={loading} />
    </div>
  );
};

export default App;
