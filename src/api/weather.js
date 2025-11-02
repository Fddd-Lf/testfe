import api from "./index";

const API_KEY = "9863b37d7fda6bfd87e07569657b22db";
const BASE_URL = "https://api.openweathermap.org";

export const weatherAPI = {
  // 获取城市联想（地理定位）
  getCities: (keyword) =>
    api.get(`${BASE_URL}/geo/1.0/direct?q=${keyword}&limit=5&appid=${API_KEY}`),

  // 获取当前天气
  getCurrentWeather: (city, units = "metric") =>
    api.get(
      `${BASE_URL}/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`
    ),

  // 获取未来预报（3 条）
  getForecast: (city, units = "metric") =>
    api.get(
      `${BASE_URL}/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${units}&cnt=3`
    ),

  // 获取空气质量（需要经纬度）
  getAirQuality: (lat, lon) =>
    api.get(
      `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    ),
};
