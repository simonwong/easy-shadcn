import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/src/button';
import { ConfigProvider } from '../index';
import { Calendar } from '../../calendar';
import { AlertModal } from '../../modal';
import { Select } from '../../select';
import zhCN from '../../locale/zh_CN';

const meta = {
  title: 'Components/ConfigProvider',
  component: ConfigProvider,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ConfigProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfigDateLocal: Story = {
  render: () => {
    return (
      <ConfigProvider>
        <div>
          <Calendar />
        </div>
        <div>
          <Select placeholder="Please select" options={[]} />
        </div>
        <Button
          onClick={() =>
            void AlertModal.confirm({
              title: 'EN',
              content: 'EN Confirm',
            })
          }
        >
          AlertModal
        </Button>
      </ConfigProvider>
    );
  },
};

export const ConfigZnLocal: Story = {
  render: () => {
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
  },
};
