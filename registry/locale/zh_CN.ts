import { zhCN as DateZnCN } from "date-fns/locale";
import type { Locale } from "./interface";

const zhCN: Locale = {
  locale: "zh-cn",
  AlertModal: {
    okText: "确定",
    cancelText: "取消",
  },
  Select: {
    empty: "暂无数据",
  },
  Calendar: DateZnCN,
};

export default zhCN;
