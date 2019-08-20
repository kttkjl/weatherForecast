import React, { useState, useRef } from "react";

const Search = ({ getCityForecast }) => {
  const [searching, setSearching] = useState(true);
  const inputRef = useRef();

  const handleSubmit = evt => {
    evt.preventDefault();
    setSearching(false);
    let [city, country = ""] = inputRef.current.value.split(/[,]+/);
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

export default Search;
