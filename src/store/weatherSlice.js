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
          temp_c:
            typeof weatherData.main?.temp === "number"
              ? weatherData.main.temp - 273.15
              : null,
          temp_f:
            typeof weatherData.main?.temp === "number"
              ? ((weatherData.main.temp - 273.15) * 9) / 5 + 32
              : null,
          feelslike_c:
            typeof weatherData.main?.feels_like === "number"
              ? weatherData.main.feels_like - 273.15
              : null,
          humidity: weatherData.main?.humidity,
          wind_kph:
            typeof weatherData.wind?.speed === "number"
              ? weatherData.wind.speed * 3.6
              : null,
          wind_dir: weatherData.wind?.deg,
          pressure_mb: weatherData.main?.pressure,
          uv: 0, // OpenWeather doesn't provide UV in current weather
          vis_km:
            typeof weatherData.visibility === "number"
              ? weatherData.visibility / 1000
              : null,
          condition: {
            text: weatherData.weather?.[0]?.description || "",
            icon: weatherData.weather?.[0]?.icon || "",
          },
          last_updated: new Date().toISOString(),
        },
        // Group forecast data by day and pick a representative (midday or closest) entry for each day
        forecast: (() => {
          if (!forecastData.list) return [];
          const daysMap = {};
          forecastData.list.forEach((item) => {
            const date = new Date(item.dt * 1000);
            // Use only the date part (YYYY-MM-DD)
            const dayKey = date.toISOString().split("T")[0];
            if (!daysMap[dayKey]) daysMap[dayKey] = [];
            daysMap[dayKey].push(item);
          });
          // Get the next 5 unique days (skip today if partial)
          const allDays = Object.keys(daysMap).sort();
          // Optionally skip today if it's partial (less than 8 intervals)
          let startIdx = 0;
          if (daysMap[allDays[0]] && daysMap[allDays[0]].length < 8) {
            startIdx = 1;
          }
          const next5Days = allDays.slice(startIdx, startIdx + 5);
          return next5Days.map((dayKey) => {
            const dayItems = daysMap[dayKey];
            // Pick the item closest to 12:00 (midday)
            const middayItem = dayItems.reduce((prev, curr) => {
              const prevHour = Math.abs(
                new Date(prev.dt * 1000).getHours() - 12
              );
              const currHour = Math.abs(
                new Date(curr.dt * 1000).getHours() - 12
              );
              return currHour < prevHour ? curr : prev;
            });
            return {
              date: new Date(middayItem.dt * 1000),
              temp_c:
                typeof middayItem.main?.temp === "number"
                  ? middayItem.main.temp - 273.15
                  : null,
              temp_f:
                typeof middayItem.main?.temp === "number"
                  ? ((middayItem.main.temp - 273.15) * 9) / 5 + 32
                  : null,
              humidity: middayItem.main?.humidity,
              wind_kph: middayItem.wind?.speed * 3.6,
              wind_dir: middayItem.wind?.deg,
              condition: {
                text: middayItem.weather?.[0]?.description || "",
                icon: middayItem.weather?.[0]?.icon || "",
              },
            };
          });
        })(),
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
