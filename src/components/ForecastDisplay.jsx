import React from "react";

const ForecastDisplay = ({ forecast }) => {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">5-Day Forecast</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-sm font-semibold text-gray-600 mb-3">
              {formatDate(day.date)}
            </div>
            <div className="text-4xl mb-3">{getWeatherIcon(day.condition)}</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {Math.round(day.temp_c)}°C
            </div>
            <div className="text-sm text-gray-600 mb-4 capitalize">
              {day.condition.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastDisplay;
