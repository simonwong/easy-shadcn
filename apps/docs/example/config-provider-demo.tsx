import { ConfigProvider, Calendar, Select, Button, AlertModal } from '@easy-shadcn/react';
import { zhCN } from '@easy-shadcn/react/locale';

const Demo = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div>
        <Calendar />
      </div>
      <div>
        <Select placeholder="请选择" options={[]} />
      </div>
      <Button
        onClick={() =>
          void AlertModal.confirm({
            title: '中文',
            content: '中文确认',
          })
        }
      >
        Alert 弹窗
      </Button>
    </ConfigProvider>
  );
};

export default Demo;
