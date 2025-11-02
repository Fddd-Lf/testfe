import { useReducer } from "react";
import dayjs from "dayjs";

// 初始状态
const today = dayjs().format("YYYY-MM-DD");
export const initialFormState = {
  city: "",
  date: [today, today],
  dataTypes: ["Current", "Forecast", "Air"],
  unit: "metric",
  advanced: [],
  cityInfo: {},
};

function formReducer(state, action) {
  switch (action.type) {
    case "setCity":
      return {
        ...state,
        city: action.value,
      };
    case "setDate":
      return {
        ...state,
        date: action.value,
      };
    case "setDataTypes":
      return {
        ...state,
        dataTypes: action.value,
      };
    case "setUnit":
      return {
        ...state,
        unit: action.value,
      };
    case "setAdvanceds":
      return {
        ...state,
        advanced: action.value,
      };
    case "setCityInfo":
      return {
        ...state,
        cityInfo: action.value,
      };
    case "setFormData":
      return {
        ...state,
        ...action.value,
      };

    case "reset":
      return initialFormState;
    default:
      return state;
  }
}

export function useFormReducer() {
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  return { formData, dispatch };
}
