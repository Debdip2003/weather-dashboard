import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for fetching weather data
export const fetchWeatherData = createAsyncThunk(
  "weather/fetchWeatherData",
  async (city, { rejectWithValue }) => {
    try {
      // Get current weather data directly by city name
      const weatherOptions = {
        method: "GET",
        url: `https://open-weather13.p.rapidapi.com/city?city=${encodeURIComponent(
          city
        )}&lang=EN`,
        headers: {
          "x-rapidapi-key":
            "cf1032516dmsh15df5df7707278dp1464ccjsna91bd61db460",
          "x-rapidapi-host": "open-weather13.p.rapidapi.com",
        },
      };

      const weatherResponse = await axios.request(weatherOptions);
      const weatherData = weatherResponse.data;

      // Get 5-day forecast data using coordinates from current weather
      const forecastOptions = {
        method: "GET",
        url: `https://open-weather13.p.rapidapi.com/fivedaysforcast?latitude=${weatherData.coord?.lat}&longitude=${weatherData.coord?.lon}&lang=EN`,
        headers: {
          "x-rapidapi-key":
            "cf1032516dmsh15df5df7707278dp1464ccjsna91bd61db460",
          "x-rapidapi-host": "open-weather13.p.rapidapi.com",
        },
      };

      const forecastResponse = await axios.request(forecastOptions);
      const forecastData = forecastResponse.data;

      return {
        location: {
          name: weatherData.name || city,
          country: weatherData.sys?.country || "",
          region: "",
          lat: weatherData.coord?.lat,
          lon: weatherData.coord?.lon,
        },
        current: {
          temp_c: weatherData.main?.temp - 273.15, // Convert from Kelvin to Celsius
          temp_f: ((weatherData.main?.temp - 273.15) * 9) / 5 + 32, // Convert to Fahrenheit
          feelslike_c: weatherData.main?.feels_like - 273.15,
          humidity: weatherData.main?.humidity,
          wind_kph: weatherData.wind?.speed * 3.6, // Convert from m/s to km/h
          wind_dir: weatherData.wind?.deg,
          pressure_mb: weatherData.main?.pressure,
          uv: 0, // OpenWeather doesn't provide UV in current weather
          vis_km: weatherData.visibility / 1000, // Convert from meters to km
          condition: {
            text: weatherData.weather?.[0]?.description || "",
            icon: weatherData.weather?.[0]?.icon || "",
          },
          last_updated: new Date().toISOString(),
        },
        forecast:
          forecastData.list?.slice(0, 5).map((item) => ({
            date: new Date(item.dt * 1000),
            temp_c: item.main?.temp - 273.15,
            temp_f: ((item.main?.temp - 273.15) * 9) / 5 + 32,
            humidity: item.main?.humidity,
            wind_kph: item.wind?.speed * 3.6,
            wind_dir: item.wind?.deg,
            condition: {
              text: item.weather?.[0]?.description || "",
              icon: item.weather?.[0]?.icon || "",
            },
          })) || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch weather data"
      );
    }
  }
);

const initialState = {
  currentWeather: null,
  searchHistory: [],
  loading: false,
  error: null,
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWeather: (state) => {
      state.currentWeather = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWeather = action.payload;
        state.error = null;

        // Add to search history if not already present
        const cityName = action.payload.location.name;
        if (!state.searchHistory.includes(cityName)) {
          state.searchHistory.unshift(cityName);
          // Keep only last 10 searches
          if (state.searchHistory.length > 10) {
            state.searchHistory = state.searchHistory.slice(0, 10);
          }
        }
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearWeather } = weatherSlice.actions;
export default weatherSlice.reducer;
