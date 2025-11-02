import React, { useState } from "react";
import "./App.css";
import { Card, message, Spin } from "antd";
import SearchForm from "./components/form";
import History from "./components/history";
import Data from "./components/data";
import { weatherAPI } from "./api/weather";
import { useFormReducer } from "./hooks/useFormReducer";

function App() {
  const { formData, dispatch } = useFormReducer();
  const [messageApi, contextHolder] = message.useMessage();
  const [historyList, setHistoryList] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("historyList") || "[]");
    return saved.slice(0, 5);
  });

  //data组件信息 - 存储数据和对应的单位
  const [currentInfo, setCurrentInfo] = useState({
    data: null,
    unit: "metric",
  });
  const [forecastInfo, setForecastInfo] = useState({
    data: null,
    unit: "metric",
  });
  const [airInfo, setAirInfo] = useState({ data: null, unit: "metric" });

  const [loading, setLoading] = useState(false);

  const getCurrentInfo = async (city, units) => {
    const res = await weatherAPI.getCurrentWeather(city, units);
    setCurrentInfo({ data: res, unit: units });
    console.log(res);
  };
  const getForecastInfo = async (city, units) => {
    const res = await weatherAPI.getForecast(city, units);
    setForecastInfo({ data: res, unit: units });
    console.log(res);
  };
  const getAirInfo = async (lat, lon, unit = "metric") => {
    const res = await weatherAPI.getAirQuality(lat, lon);
    // 空气质量不依赖单位，但为了统一结构也保存 unit
    setAirInfo({ data: res, unit: unit });
    console.log(res);
  };

  //搜索并新增
  const handleNewRecord = (values) => {
    setLoading(true);
    // 使用 values 中的 unit，确保使用用户提交的值
    const unit = values.unit || formData.unit;
    getCurrentInfo(formData.city, unit);
    getForecastInfo(formData.city, unit);
    getAirInfo(formData.cityInfo.lat, formData.cityInfo.lon, unit);
    values.searchTime = new Date().toLocaleString();
    const newList = [values, ...historyList].slice(0, 5);
    setHistoryList(newList);
    localStorage.setItem("historyList", JSON.stringify(newList));
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  //删除并记录
  const delItem = (data, index) => {
    const newList = historyList.filter((_, i) => i !== index);
    setHistoryList(newList);
    localStorage.setItem("historyList", JSON.stringify(newList));
  };

  //回显表单数据并自动查询
  const resetForm = async (data) => {
    // 更新 formData
    dispatch({ type: "setFormData", value: data });

    const unit = data.unit || "metric";
    const city = data.city || "";
    const cityInfo = data.cityInfo || {};

    if (city && cityInfo.lat && cityInfo.lon) {
      const dataTypes = data.dataTypes || [];
      const promises = [];

      if (dataTypes.includes("Current")) {
        promises.push(getCurrentInfo(city, unit));
      }
      if (dataTypes.includes("Forecast")) {
        promises.push(getForecastInfo(city, unit));
      }
      if (dataTypes.includes("Air")) {
        promises.push(getAirInfo(cityInfo.lat, cityInfo.lon, unit));
      }

      // 等待所有请求完成后再显示成功消息
      try {
        await Promise.all(promises);
        messageApi.success(`${city}天气查询成功`);
      } catch (err) {
        console.error("请求出错：", err);
        messageApi.error(`${city}天气查询失败：${err.message || err}`);
      }
    }
  };

  return (
    <>
      <Spin spinning={loading}>
        {contextHolder}
        <div className="app-container">
          <Card style={{ width: "35%", height: "100%", marginRight: "10px" }}>
            <SearchForm
              formData={formData}
              dispatch={dispatch}
              handleNewRecord={handleNewRecord}
            />
          </Card>
          <Card
            className="data-history-card"
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Data
              formData={formData}
              info={{
                Current: { data: currentInfo.data, unit: currentInfo.unit },
                Forecast: { data: forecastInfo.data, unit: forecastInfo.unit },
                Air: { data: airInfo.data, unit: airInfo.unit },
              }}
            />
            <History
              historyList={historyList}
              delItem={delItem}
              resetForm={resetForm}
            />
          </Card>
        </div>
      </Spin>
    </>
  );
}

export default App;
