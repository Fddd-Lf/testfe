import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, Card, Table, Progress, Descriptions, Image } from "antd";

function Current({ loading, data, unit }) {
  useEffect(() => {
    console.log(data, "Current");
  }, [data]);

  if (!data || !data.main) {
    return (
      <Card loading={loading} title="当前天气">
        <div style={{ textAlign: "center", color: "#999" }}>暂无数据</div>
      </Card>
    );
  }

  const temp = Math.round(data.main.temp);
  const tempUnit = unit === "metric" ? "°C" : "°F";
  const windSpeed = data.wind?.speed || 0;
  const windUnit = unit === "metric" ? "m/s" : "mph";
  const humidity = data.main.humidity;
  const weather = data.weather?.[0];
  const weatherIcon = weather?.icon
    ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
    : null;

  return (
    <Card loading={loading} title="当前天气">
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {weatherIcon && (
          <Image
            src={weatherIcon}
            alt={weather?.description}
            preview={false}
            width={80}
          />
        )}
        <div style={{ fontSize: 32, fontWeight: "bold", marginTop: 8 }}>
          {temp}
          {tempUnit}
        </div>
        <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
          {weather?.description || weather?.main || "未知"}
        </div>
      </div>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="温度">
          {temp}
          {tempUnit}
        </Descriptions.Item>
        <Descriptions.Item label="天气状况">
          {weather?.main || "未知"}
        </Descriptions.Item>
        <Descriptions.Item label="湿度">{humidity}%</Descriptions.Item>
        <Descriptions.Item label="风速">
          {windSpeed.toFixed(1)} {windUnit}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

function Forecast({ loading, data, unit }) {
  useEffect(() => {
    console.log(data, "Forecast");
  }, [data]);

  const tempUnit = unit === "metric" ? "°C" : "°F";

  // 处理预报数据
  const dataSource = useMemo(() => {
    if (!data || !data.list || !Array.isArray(data.list)) {
      return [];
    }

    const dayNames = ["明天", "后天", "大后天"];

    return data.list.slice(0, 3).map((item, index) => {
      const date = new Date(item.dt * 1000);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const weather = item.weather?.[0];
      const icon = weather?.icon
        ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
        : null;

      return {
        key: index,
        date: dayNames[index] || dateStr,
        maxTemp: Math.round(item.main.temp_max),
        minTemp: Math.round(item.main.temp_min),
        icon: icon,
        description: weather?.description || weather?.main || "未知",
      };
    });
  }, [data]);

  const columns = [
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      align: "center",
    },
    {
      title: "最高",
      dataIndex: "maxTemp",
      key: "maxTemp",
      align: "center",
      render: (temp) => `${temp}${tempUnit}`,
    },
    {
      title: "最低温",
      dataIndex: "minTemp",
      key: "minTemp",
      align: "center",
      render: (temp) => `${temp}${tempUnit}`,
    },
    {
      title: "天气图标",
      dataIndex: "icon",
      key: "icon",
      align: "center",
      render: (icon, record) =>
        icon ? (
          <Image
            src={icon}
            alt={record.description}
            preview={false}
            width={40}
          />
        ) : (
          "-"
        ),
    },
  ];

  return (
    <Card loading={loading} title="未来预报">
      <Table
        scroll={{
          x: true,
        }}
        dataSource={dataSource}
        pagination={false}
        columns={columns}
        size="small"
      />
    </Card>
  );
}

function Air({ loading, data }) {
  useEffect(() => {
    console.log(data, "Air");
  }, [data]);

  if (!data || !data.list || !data.list[0]) {
    return (
      <Card loading={loading} title="空气质量">
        <div style={{ textAlign: "center", color: "#999" }}>暂无数据</div>
      </Card>
    );
  }

  const airData = data.list[0];
  const aqi = airData.main?.aqi || 0;
  const components = airData.components || {};

  // AQI 等级映射 (1-5)
  const aqiLevels = {
    1: { label: "优秀", color: "#52c41a", percent: 20 },
    2: { label: "良好", color: "#73d13d", percent: 40 },
    3: { label: "中等", color: "#faad14", percent: 60 },
    4: { label: "较差", color: "#ff7875", percent: 80 },
    5: { label: "很差", color: "#ff4d4f", percent: 100 },
  };

  const aqiInfo = aqiLevels[aqi] || {
    label: "未知",
    color: "#999",
    percent: 0,
  };

  // 找出主要污染物（值最大的）
  const pollutantNames = {
    co: "一氧化碳 (CO)",
    no: "一氧化氮 (NO)",
    no2: "二氧化氮 (NO₂)",
    o3: "臭氧 (O₃)",
    so2: "二氧化硫 (SO₂)",
    pm2_5: "PM2.5",
    pm10: "PM10",
  };

  let mainPollutant = null;
  let maxValue = 0;
  Object.keys(components).forEach((key) => {
    if (components[key] > maxValue && key !== "nh3") {
      maxValue = components[key];
      mainPollutant = {
        name: pollutantNames[key] || key,
        value: components[key],
        unit:
          key === "co" ||
          key === "o3" ||
          key === "so2" ||
          key === "no" ||
          key === "no2"
            ? "μg/m³"
            : key === "pm2_5" || key === "pm10"
            ? "μg/m³"
            : "",
      };
    }
  });

  return (
    <Card loading={loading} title="空气质量">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Progress
          type="circle"
          percent={aqiInfo.percent}
          format={() => aqiInfo.label}
          strokeColor={aqiInfo.color}
          size={120}
        />
        <div style={{ marginTop: 16, fontSize: 16, fontWeight: "bold" }}>
          AQI 指数: {aqi}
        </div>
      </div>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="AQI 等级">{aqiInfo.label}</Descriptions.Item>
        {mainPollutant && (
          <Descriptions.Item label="主要污染物">
            {mainPollutant.name}: {mainPollutant.value.toFixed(2)}{" "}
            {mainPollutant.unit}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

export default function Data({ formData, info }) {
  const [loading, setLoading] = useState(true);

  const components = {
    Current,
    Forecast,
    Air,
  };

  const getcomponentsSpan = () => {
    if (formData.dataTypes.length == 3) {
      return 8;
    } else if (formData.dataTypes.length == 2) {
      return 12;
    } else {
      return 24;
    }
  };

  // 使用 useMemo 创建稳定的依赖项
  const dataTypesKey = useMemo(
    () => formData.dataTypes?.join(",") || "",
    [formData.dataTypes]
  );

  useEffect(() => {
    console.log(formData.dataTypes, "变化了");
    setLoading(false);
    // const timer = setTimeout(() => {
    //   setLoading(false);
    // }, 1000);

    // return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTypesKey]);

  return (
    <div className="data-container">
      <Row gutter={16} style={{ height: "100%" }}>
        {formData.dataTypes.map((item) => {
          const Component = components[item];
          return (
            <Col
              key={item}
              span={getcomponentsSpan()}
              style={{ height: "100%" }}
            >
              <Component
                data={info[item]?.data || info[item]}
                loading={loading}
                unit={info[item]?.unit || formData.unit}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
