import "./Weather.css";

import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import humidity_icon from "../assets/humidity.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import { useCallback, useEffect, useRef, useState } from "react";

const allIcons = {
  0: clear_icon,
  1: cloud_icon,
  2: drizzle_icon,
  3: rain_icon,
  4: snow_icon,
};

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const inputRef = useRef();
  const search = useCallback(async (city) => {
    try {
      if (city === "") {
        alert("Please enter a city name");
        return;
      }
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const response = await fetch(url);
      const data = await response.json();

      if(!response.ok){
        alert(data.message)
        return
      }

      if (!data.results || data.results.length === 0) {
        throw new Error("No location found");
      }

      const { latitude, longitude, name } = data.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`,
      );
      const weatherData = await weatherRes.json();

      if(!weatherRes.ok){
        alert(weatherData.message)
        return
      }
      console.log(weatherData);
      const icon =
        allIcons[weatherData.current_weather.weathercode] || clear_icon;
      setWeather({
        humidity:Math.floor(weatherData.hourly.relative_humidity_2m[0]),
        wind: Math.floor(weatherData.current_weather.windspeed),
        temperature:Math.floor(weatherData.current_weather.temperature),
        location: name,
        icon: icon,
      });
      return weatherData;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(false);
    }
  }, []);
  useEffect(() => {
    search("London");
  }, [search]);

  return (
    <div className="weather">
      <div className="searchbar">
        <input ref={inputRef} onKeyDown={(e)=>{if(e.key === 'Enter') search(inputRef.current.value)}} type="text" placeholder="Search city..." />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current.value)}
        />
      </div>
      {weather ? (
        <>
          <img src={weather.icon} alt="Weather" className="weather-icon" />
          <p className="temperature">{weather.temperature}°C</p>
          <p className="location">{weather.location}</p>
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <p>{weather.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind" />
              <div>
                <p>{weather.wind} km/h</p>
                <span>Wind</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Weather;
