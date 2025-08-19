import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import WeatherDashboard from "./components/WeatherDashboard";

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <WeatherDashboard />
      </div>
    </Provider>
  );
}

export default App;
