import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeatherData, clearError } from '../store/weatherSlice';
import SearchBar from './SearchBar';
import WeatherDisplay from './WeatherDisplay';
import ForecastDisplay from './ForecastDisplay';
import SearchHistory from './SearchHistory';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const WeatherDashboard = () => {
  const dispatch = useDispatch();
  const { currentWeather, searchHistory, loading, error } = useSelector((state) => state.weather);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (city) => {
    if (city.trim()) {
      dispatch(fetchWeatherData(city.trim()));
      setSearchTerm('');
    }
  };

  const handleHistoryClick = (city) => {
    dispatch(fetchWeatherData(city));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Weather Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Get real-time weather information for any city
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage 
            message={error} 
            onClose={handleClearError}
          />
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center mb-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weather Display */}
        <div className="lg:col-span-2">
          {currentWeather && (
            <>
              <WeatherDisplay weather={currentWeather} />
              <ForecastDisplay forecast={currentWeather.forecast} />
            </>
          )}
        </div>

        {/* Search History */}
        <div className="lg:col-span-1">
          <SearchHistory 
            history={searchHistory}
            onHistoryClick={handleHistoryClick}
            loading={loading}
          />
        </div>
      </div>

      {/* Welcome Message */}
      {!currentWeather && !loading && !error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Welcome to Weather Dashboard
          </h2>
          <p className="text-gray-600">
            Enter a city name above to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;
