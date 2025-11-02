import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Button,
  Checkbox,
  Form,
  AutoComplete,
  DatePicker,
  Radio,
  Select,
} from "antd";
import dayjs from "dayjs";
import { weatherAPI } from "../api/weather";

const DATA_TYPES = [
  { label: "当前天气", value: "Current" },
  { label: "未来预报", value: "Forecast" },
  { label: "空气质量", value: "Air" },
];

const UNITS = [
  { label: "摄氏度", value: "metric" },
  { label: "华氏度", value: "imperial" },
];

const ADVANCED_OPTIONS = [
  { label: "风力等级 ≥3 级", value: "wind3" },
  { label: "湿度 ≥60%", value: "humidity60" },
];

const { RangePicker } = DatePicker;
export default function SearchForm({ formData, dispatch, handleNewRecord }) {
  const [form] = Form.useForm();
  const [cityOptions, setCityOptions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const searchTimerRef = useRef(null);
  const today = dayjs();

  const disabledDate = (current) => {
    const sevenDaysAgo = today.subtract(6, "day").startOf("day");
    return current && (current < sevenDaysAgo || current > today.endOf("day"));
  };

  // 至少选择一种数据类型
  const validateTypes = (_, value) => {
    if (!value || value.length === 0) {
      return Promise.reject(new Error("至少选择一种数据类型"));
    }
    return Promise.resolve();
  };

  // 日期范围校验
  const validateDateRange = (_, value) => {
    if (!value || value.length !== 2) {
      return Promise.reject(new Error("请选择时间范围"));
    }
    if (value[1].isBefore(value[0])) {
      return Promise.reject(new Error("结束日期不能早于开始日期"));
    }
    return Promise.resolve();
  };

  // 城市下拉搜索
  const handleCitySearch = async (value) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const trimmedValue = value?.trim();
    if (!trimmedValue || trimmedValue.length < 1) {
      setCityOptions([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setCityLoading(true);
      try {
        const res = await weatherAPI.getCities(
          encodeURIComponent(trimmedValue)
        );
        console.log("城市搜索结果:", res);

        if (!Array.isArray(res) || res.length === 0) {
          setCityOptions([]);
          return;
        }

        const formattedOptions = res.map((city) => {
          const displayName = city.local_names?.zh || city.name;
          const labelParts = [
            displayName,
            city.name !== displayName ? `(${city.name})` : null,
            city.state,
            city.country,
          ]
            .filter(Boolean)
            .join(", ");

          return {
            key: `${displayName}-${city.lat}-${city.lon}`,
            value: displayName,
            label: labelParts,
            lat: city.lat,
            lon: city.lon,
          };
        });

        setCityOptions(formattedOptions);
      } catch (error) {
        console.error("❌ 获取城市数据失败:", error);
        setCityOptions([]);
      } finally {
        setCityLoading(false);
      }
    }, 300);
  };

  // 城市输入/选择变化处理
  const handleCityChange = (value) => {
    console.log("城市值:", value);
    dispatch({ type: "setCity", value: value || "" });
    if (!value) {
      dispatch({ type: "setCityInfo", value: {} });
    }
  };

  // 城市选择处理 - 获取完整对象
  const handleCitySelect = (value, option) => {
    console.log("完整城市对象:", option);
    dispatch({ type: "setCityInfo", value: option || {} });
  };

  const changeCheckbox = (change) => {
    dispatch({ type: "setDataTypes", value: change });
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const dateArray = dates
        .map((d) => (d ? d.format("YYYY-MM-DD") : null))
        .filter(Boolean);
      dispatch({ type: "setDate", value: dateArray });
    } else {
      dispatch({ type: "setDate", value: [] });
    }
  };

  const onFinish = useCallback(
    (values) => {
      console.log("查询参数:", { ...values, cityInfo: formData.cityInfo });
      if (values.unit !== formData.unit) {
        dispatch({ type: "setUnit", value: values.unit });
      }
      let info = { ...values, cityInfo: formData.cityInfo };
      handleNewRecord(info);
    },
    [formData.cityInfo, formData.unit, dispatch, handleNewRecord]
  );

  const handleUnitChange = (e) => {
    dispatch({ type: "setUnit", value: e.target.value });
  };

  const handleReset = () => {
    dispatch({ type: "reset" });
    form.resetFields();
    setCityOptions([]);
    const defaultDate = [today, today];
    form.setFieldsValue({
      city: "",
      date: defaultDate,
      dataTypes: ["Current", "Forecast", "Air"],
      unit: "metric",
      advanced: [],
    });
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (formData.cityInfo && formData.cityInfo.lat && formData.cityInfo.lon) {
      console.log("cityInfo 已更新:", formData.cityInfo);
      const cityValue = formData.cityInfo.value || formData.city;
      if (formData.city && cityValue) {
        setCityOptions((prevOptions) => {
          const exists = prevOptions.some(
            (option) =>
              option.value === cityValue || option.value === formData.city
          );
          if (!exists) {
            return [
              {
                key: `${cityValue}-${formData.cityInfo.lat}-${formData.cityInfo.lon}`,
                value: cityValue,
                label: formData.cityInfo.label || formData.city,
                lat: formData.cityInfo.lat,
                lon: formData.cityInfo.lon,
              },
              ...prevOptions,
            ];
          }
          return prevOptions;
        });
      }
    }
  }, [formData.cityInfo, formData.city]);

  useEffect(() => {
    const defaultDate =
      formData.date && formData.date.length > 0
        ? formData.date.map((d) => dayjs(d))
        : [today, today];

    const currentCity = form.getFieldValue("city");
    const hasCityInfo =
      formData.cityInfo && formData.cityInfo.lat && formData.cityInfo.lon;
    const shouldUpdateCity =
      formData.city === "" ||
      currentCity === undefined ||
      (hasCityInfo && formData.city && currentCity !== formData.city);

    const currentUnit = form.getFieldValue("unit");
    const shouldUpdateUnit =
      currentUnit === undefined || currentUnit !== formData.unit;

    form.setFieldsValue({
      city: shouldUpdateCity ? formData.city : currentCity,
      date: defaultDate,
      dataTypes: formData.dataTypes,
      ...(shouldUpdateUnit && { unit: formData.unit }),
      advanced: formData.advanced,
    });
  }, [
    formData.date,
    formData.dataTypes,
    formData.unit,
    formData.advanced,
    formData.city,
    formData.cityInfo,
    form,
    today,
  ]);

  return (
    <Form
      form={form}
      name="weather-search"
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
    >
      <Form.Item
        label="城市搜索"
        name="city"
        rules={[{ required: true, message: "请输入城市" }]}
      >
        <AutoComplete
          options={cityOptions}
          onSearch={handleCitySearch}
          onChange={handleCityChange}
          onSelect={handleCitySelect}
          placeholder="输入城市名..."
          allowClear
          loading={cityLoading}
          filterOption={false}
        />
      </Form.Item>

      <Form.Item
        label="日期范围"
        name="date"
        rules={[{ validator: validateDateRange }]}
        initialValue={[today, today]}
      >
        <RangePicker
          format="YYYY-MM-DD"
          disabledDate={disabledDate}
          allowClear={false}
          onChange={handleDateRangeChange}
        />
      </Form.Item>

      <Form.Item
        label="数据类型"
        name="dataTypes"
        rules={[{ validator: validateTypes }]}
      >
        <Checkbox.Group onChange={changeCheckbox} options={DATA_TYPES} />
      </Form.Item>

      <Form.Item label="单位设置" name="unit" initialValue="metric">
        <Radio.Group
          options={UNITS}
          optionType="button"
          buttonStyle="solid"
          onChange={handleUnitChange}
        />
      </Form.Item>

      <Form.Item label="高级筛选" name="advanced" initialValue={[]}>
        <Select
          options={ADVANCED_OPTIONS}
          allowClear
          mode="multiple"
          placeholder="不筛选"
          disabled={!form.getFieldValue("dataTypes")?.includes("Current")}
        />
      </Form.Item>

      <Form.Item>
        <Button
          style={{ width: "100%" }}
          type="primary"
          htmlType="submit"
          disabled={!form.getFieldValue("city")}
        >
          查询
        </Button>
      </Form.Item>
      <Form.Item>
        <Button style={{ width: "100%" }} onClick={handleReset}>
          重置
        </Button>
      </Form.Item>
    </Form>
  );
}
