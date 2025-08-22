import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for fetching weather data
export const fetchWeatherData = createAsyncThunk(
  "weather/fetchWeatherData",
  async (city, { rejectWithValue }) => {
    try {
      // Get latitude and longitude from city name using OpenCage Geocoding API
      const geoApiKey = "4d69c1213f3843128fdfc00840829d3c";
      const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        city
      )}&key=${geoApiKey}`;
      const geoResponse = await axios.get(geoUrl);
      const geoData = geoResponse.data;
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Could not find location for the given city");
      }
      const lat = geoData.results[0].geometry.lat;
      const lon = geoData.results[0].geometry.lng;
      const date = new Date().toISOString().split("T")[0];
      const weatherOptions = {
        method: "GET",
        url: `https://ai-weather-by-meteosource.p.rapidapi.com/time_machine?lat=${lat}&lon=${lon}&date=${date}&units=auto`,
        headers: {
          "x-rapidapi-key":
            "cf1032516dmsh15df5df7707278dp1464ccjsna91bd61db460",
          "x-rapidapi-host": "ai-weather-by-meteosource.p.rapidapi.com",
        },
      };

      const weatherResponse = await axios.request(weatherOptions);
      const weatherData = weatherResponse.data;

      // Map Meteosource API response to app structure
      const firstHour = weatherData.data && weatherData.data[0];
      return {
        location: {
          name: city,
          country: "",
          region: "",
          lat: weatherData.lat,
          lon: weatherData.lon,
        },
        current: {
          temp_f: firstHour ? firstHour.temperature : null,
          feelslike_f: firstHour ? firstHour.feels_like : null,
          humidity: firstHour ? firstHour.humidity : null,
          wind_kph: firstHour
            ? Math.round(firstHour.wind.speed * 1.60934)
            : null,
          wind_dir: firstHour ? firstHour.wind.angle : null,
          pressure_mb: firstHour ? firstHour.pressure : null,
          uv:
            firstHour && typeof firstHour.ozone === "number"
              ? firstHour.ozone
              : null,
          vis_km:
            firstHour && typeof firstHour.dew_point === "number"
              ? firstHour.dew_point
              : null,
          condition: {
            text: firstHour ? firstHour.weather.replace(/_/g, " ") : "",
            icon: firstHour ? firstHour.icon : "",
          },
          last_updated: firstHour ? firstHour.date : new Date().toISOString(),
        },
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
