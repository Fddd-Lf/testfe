# 构建依赖&开发模式

npm i && npm run dev

### 特殊说明

**日期范围和高级筛选**：由于需求原因，这两个字段只做数据储存与回显，并不参与数据的交互。它们会被保存到历史记录中，但在实际 API 查询时不会使用这些条件进行筛选。

## 技术栈

- **React** 19.1.1
- **Ant Design** 5.27.6
- **Axios** 1.13.1
- **dayjs** 1.11.18
- **Vite** 7.1.7

## 核心功能

### 1. 高级搜索表单

- **城市搜索**：支持输入联想（AutoComplete），输入 ≥2 个字符时触发城市名联想
- **日期范围**：DatePicker.RangePicker 选择查询日期（默认今日，可查近 7 天历史数据）
- **数据类型**：Checkbox.Group 多选（当前天气、未来预报、空气质量）
- **单位设置**：Radio.Group 单选（摄氏度/华氏度，默认摄氏度）
- **高级筛选**：Select 下拉选择（风力等级 ≥3 级 / 湿度 ≥60%，默认不筛选）

### 2. 数据展示

- **当前天气**：温度、天气状况、湿度、风速（根据单位设置自动转换）
- **未来预报**：Table 展示未来 3 天数据（日期、最高/最低温、天气图标）
- **空气质量**：Card 展示 AQI 指数、主要污染物，用 Progress 组件可视化 AQI 等级
- 根据表单选择的「数据类型」动态展示对应模块

### 3. 历史查询管理

- 使用 Table 组件展示最近 5 条查询记录（含查询时间、城市、数据类型）
- 每条记录支持「重新查询」（点击后回显表单条件并自动提交）和「删除」操作
- 记录持久化：使用 localStorage 存储，刷新页面不丢失

## 表单设计思路

### 1. 状态管理架构

#### 双层状态管理

- **useReducer + useFormReducer Hook**：管理全局表单数据状态
  - 使用 `useReducer` 统一管理复杂表单状态（城市、日期、数据类型、单位、高级筛选、城市信息等）
  - 通过 `dispatch` 函数统一更新状态，保证状态变更的可追溯性
  - 初始状态定义在 `useFormReducer.js` 中，便于统一管理
- **Ant Design Form.useForm()**：管理表单控件状态和校验
  - 使用 `Form.useForm()` 创建表单实例，管理表单字段值、校验规则
  - 通过 `form.setFieldsValue()` 实现表单回显功能
  - 利用表单内置校验机制处理字段校验逻辑

#### 状态同步机制

```javascript
// formData 变化时同步到 Form 实例
useEffect(() => {
  form.setFieldsValue({
    city: formData.city,
    date: formData.date,
    dataTypes: formData.dataTypes,
    unit: formData.unit,
    advanced: formData.advanced,
  });
}, [formData, form]);
```

### 2. 表单控件设计

#### 城市搜索（AutoComplete）

- **触发条件**：输入 ≥2 个字符时触发城市联想搜索
- **防抖处理**：使用 `setTimeout` 实现 300ms 防抖，减少 API 调用
- **联想功能**：调用 OpenWeather API 的 Geo API，支持中英文城市名搜索
- **数据格式**：存储城市名称和经纬度信息（用于空气质量查询）
- **校验规则**：必填项，未填写时提交按钮置灰

#### 日期范围（DatePicker.RangePicker）

- **日期限制**：通过 `disabledDate` 限制只能选择近 7 天（含今日）
- **默认值**：默认选择今日
- **数据存储**：格式化为 `["YYYY-MM-DD", "YYYY-MM-DD"]` 数组
- **校验规则**：结束日期不能早于开始日期
- **特殊说明**：日期范围只做数据储存与回显，不参与数据的交互（不用于 API 查询）

#### 数据类型（Checkbox.Group）

- **选项配置**：Current（当前天气）、Forecast（未来预报）、Air（空气质量）
- **默认值**：全选
- **校验规则**：至少选择一种数据类型
- **联动效果**：控制数据展示模块的显示/隐藏

#### 单位设置（Radio.Group）

- **选项**：摄氏度（metric）、华氏度（imperial）
- **默认值**：摄氏度
- **数据影响**：影响温度、风速等数据的单位和数值

#### 高级筛选（Select）

- **选项**：风力等级 ≥3 级（wind3）、湿度 ≥60%（humidity60）
- **模式**：多选模式
- **默认值**：空数组（不筛选）
- **联动效果**：仅在选择「当前天气」数据类型时启用
- **特殊说明**：高级筛选只做数据储存与回显，不参与数据的交互（不用于实际筛选）

### 3. 表单校验策略

#### 必填校验

- **城市**：使用 `rules={[{ required: true, message: "请输入城市" }]}`

#### 自定义校验

- **数据类型**：使用 `validator` 函数，至少选择一种

  ```javascript
  const validateTypes = (_, value) => {
    if (!value || value.length === 0) {
      return Promise.reject(new Error("至少选择一种数据类型"));
    }
    return Promise.resolve();
  };
  ```

- **日期范围**：使用 `validator` 函数，校验结束日期不能早于开始日期
  ```javascript
  const validateDateRange = (_, value) => {
    if (!value || value.length !== 2) {
      return Promise.reject(new Error("请选择时间范围"));
    }
    if (value[1].isBefore(value[0])) {
      return Promise.reject(new Error("结束日期不能早于开始日期"));
    }
    return Promise.resolve();
  };
  ```

#### 提交按钮状态控制

```javascript
<Button htmlType="submit" disabled={!form.getFieldValue("city")}>
  查询
</Button>
```

- 城市为空时按钮置灰，防止无效提交

### 4. 表单回显机制

#### 历史记录回显

```javascript
const resetForm = async (data) => {
  // 1. 更新 formData（通过 dispatch）
  dispatch({ type: "setFormData", value: data });

  // 2. Form 实例通过 useEffect 自动同步
  // 3. 根据数据类型自动触发 API 请求
  if (dataTypes.includes("Current")) {
    promises.push(getCurrentInfo(city, unit));
  }
  // ...
};
```

### 5. 数据提交处理

#### 提交流程

1. **表单校验**：通过 Form 内置校验机制验证字段
2. **数据合并**：将 Form 表单值与 formData 中的 cityInfo 合并
3. **API 请求**：根据数据类型并发请求多个 API
4. **历史记录**：保存查询记录到 localStorage（最多 5 条）
5. **数据展示**：更新各数据模块的展示状态

```javascript
const onFinish = useCallback(
  (values) => {
    let info = { ...values, cityInfo: formData.cityInfo };
    handleNewRecord(info);
  },
  [formData.cityInfo, handleNewRecord]
);
```
