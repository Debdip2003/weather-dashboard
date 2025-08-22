import React from "react";

const WeatherDisplay = ({ weather }) => {
  const { location, current } = weather;

  const getWeatherIcon = (condition) => {
    const conditionText = condition.text.toLowerCase();
    if (conditionText.includes("sunny") || conditionText.includes("clear"))
      return "☀️";
    if (conditionText.includes("cloudy") || conditionText.includes("overcast"))
      return "☁️";
    if (conditionText.includes("rain") || conditionText.includes("drizzle"))
      return "🌧️";
    if (conditionText.includes("snow")) return "❄️";
    if (conditionText.includes("thunder")) return "⛈️";
    if (conditionText.includes("fog") || conditionText.includes("mist"))
      return "🌫️";
    return "🌤️";
  };

  const getWindDirection = (degrees) => {
    if (typeof degrees !== "number") return degrees;
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Show Kelvin if temp_c is null but temp is present (Kelvin), else show F
  let tempDisplay = "N/A";
  if (typeof current.temp_c === "number") {
    tempDisplay = `${Math.round(current.temp_c)}°C`;
  } else if (
    typeof weather.current?.temp === "number" &&
    (current.temp_c === null || isNaN(current.temp_c))
  ) {
    tempDisplay = `${Math.round(weather.current.temp)}K`;
  } else if (typeof current.temp_f === "number") {
    tempDisplay = `${Math.round(current.temp_f)}°F`;
  }

  let feelsLikeDisplay = "N/A";
  if (typeof current.feelslike_c === "number") {
    feelsLikeDisplay = `${Math.round(current.feelslike_c)}°C`;
  } else if (
    typeof weather.current?.feels_like === "number" &&
    (current.feelslike_c === null || isNaN(current.feelslike_c))
  ) {
    feelsLikeDisplay = `${Math.round(weather.current.feels_like)}K`;
  } else if (typeof current.temp_f === "number") {
    feelsLikeDisplay = `${Math.round(current.temp_f)}°F`;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Location Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {location.name}
        </h2>
        <p className="text-gray-600 text-lg">
          {location.region && `${location.region}, `}
          {location.country}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {formatTime(current.last_updated)}
        </p>
      </div>

      {/* Main Weather Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Temperature and Condition */}
        <div className="text-center">
          <div className="text-7xl md:text-8xl mb-4">
            {getWeatherIcon(current.condition)}
          </div>
          <div className="text-5xl md:text-6xl font-bold text-gray-800 mb-3">
            {tempDisplay}
          </div>
          <div className="text-xl text-gray-600 mb-3 capitalize">
            {current.condition.text}
          </div>
          <div className="text-lg text-gray-500">
            Feels like {feelsLikeDisplay}
          </div>
        </div>

        {/* Additional Weather Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-600 font-medium">Humidity</span>
            <span className="font-bold text-gray-800 text-lg">
              {current.humidity}%
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-600 font-medium">Wind Speed</span>
            <span className="font-bold text-gray-800 text-lg">
              {Math.round(current.wind_kph)} km/h
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-600 font-medium">Wind Direction</span>
            <span className="font-bold text-gray-800 text-lg">
              {getWindDirection(current.wind_dir)}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-600 font-medium">Pressure</span>
            <span className="font-bold text-gray-800 text-lg">
              {current.pressure_mb} mb
            </span>
          </div>
        </div>
      </div>

      {/* UV Index and Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">UV Index</p>
              {current.uv !== null && current.uv !== undefined ? (
                <p className="text-3xl font-bold">{current.uv}</p>
              ) : (
                <div className="flex flex-col items-start">
                  <p className="text-base font-semibold">Stay sun safe!</p>
                  <span className="text-lg">🧴</span>
                </div>
              )}
            </div>
            <div className="text-4xl">☀️</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Visibility</p>
              {current.vis_km !== null && current.vis_km !== undefined ? (
                <p className="text-3xl font-bold">{`${Math.round(
                  current.vis_km
                )} km`}</p>
              ) : (
                <div className="flex flex-col items-start">
                  <p className="text-base font-semibold">Drive carefully!</p>
                  <span className="text-lg">🚗</span>
                </div>
              )}
            </div>
            <div className="text-4xl">👁️</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
