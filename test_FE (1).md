√=ui 完成
✔️=功能完成

任务目标
实现一个「多条件天气数据查询与管理系统」，重点考察 React Hooks 运用、Ant Design 表单控件使用能力，以及 API 交互逻辑。通过复杂表单场景展示对表单状态管理、校验、联动的掌握。
技术栈要求
React.js（≥19.x）
React Hooks（useState、useEffect、useReducer、useCallback 必用）
Ant Design（≥5.x）：重点使用 Form、Input、Select、DatePicker、Checkbox 等表单控件
API 交互（Axios 推荐，需处理请求拦截 / 响应拦截）
核心功能需求

1. 高级搜索表单（重点考察 Form 控件）
   使用 Ant Design Form 组件实现多条件查询，包含以下字段：
   城市搜索：支持输入联想（输入 ≥2 个字符时触发城市名联想，使用 AutoComplete 控件） √ ✔️
   日期范围：DatePicker.RangePicker 选择查询日期（默认今日，可查近 7 天历史数据）√ ✔️
   数据类型：Checkbox.Group 多选（至少包含「当前天气」「未来预报」「空气质量」）√ ✔️
   单位设置：Radio.Group 单选（摄氏度 / 华氏度，默认摄氏度）√ ✔️
   高级筛选：Select 下拉选择（风力等级 ≥3 级 / 湿度 ≥60%，默认不筛选） √ ✔️
   表单校验：城市为必填项，未选择时提交按钮置灰并提示；日期范围结束日不能早于开始日 √ ✔️
2. 数据展示与交互
   根据表单选择的「数据类型」动态展示对应模块（如未选「空气质量」则隐藏该模块）√ ✔️
   展示内容：
   当前天气：温度、天气状况、湿度、风速（根据单位设置自动转换）√ ✔️
   未来预报：Table 展示未来 3 天数据（日期、最高 / 最低温、天气图标）√ ✔️
   空气质量：Card 展示 AQI 指数、主要污染物，用 Progress 组件可视化 AQI 等级 √ ✔️
   交互反馈：
   提交表单时显示 Spin 加载状态 √ ✔️
   数据加载完成后，用 Message 提示查询成功（含查询条件摘要） √ ✔️
   错误处理：城市不存在时用 Modal.error 展示详细错误信息 √ ✔️
3. 历史查询管理
   使用 List 组件展示最近 5 条查询记录（含查询时间、城市、数据类型） √ ✔️
   每条记录支持「重新查询」（点击后回显表单条件并自动提交）和「删除」操作 √ ✔️
   记录持久化：使用 localStorage 存储，刷新页面不丢失 √ ✔️
   公开 API 说明
   仍采用 OpenWeather API，扩展接口如下：
   基础文档：OpenWeather API Docs
   当前天气：https://api.openweathermap.org/data/2.5/weather?q={城市名}&appid={API_KEY}&units={单位}
   单位参数：metric（摄氏度）/imperial（华氏度）
   未来预报：https://api.openweathermap.org/data/2.5/forecast?q={城市名}&appid={API_KEY}&units={单位}&cnt=3
   空气质量：https://api.openweathermap.org/data/2.5/air_pollution?q={城市名}&appid={API_KEY}
   城市联想接口（用于 AutoComplete）：https://api.openweathermap.org/geo/1.0/direct?q={输入值}&limit=5&appid={API_KEY}
   测试用 API_KEY：xxxxxxxxxx（建议自行注册免费 Key 避免限额）
   实现要求
   表单逻辑：必须使用 Ant Design Form.useForm() 管理表单状态，禁止手动维护 useState √ ✔️
   控件联动：例如「高级筛选」在未选择「当前天气」时置灰禁用
   代码拆分：至少包含 WeatherSearchForm（表单组件）、WeatherDisplay（展示组件）、HistoryList（历史记录组件）
   请求封装：用 Axios 创建实例，配置请求 / 响应拦截器（统一处理 loading、错误提示）
   Hooks 深度：需使用 useReducer 管理复杂状态（如历史记录的增删）

提交方式
Git 提交：同之前要求，仓库需包含完整代码、README（含运行步骤、表单设计思路）
