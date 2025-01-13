import { InfoCircledIcon } from '@radix-ui/react-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '../index';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    children: <InfoCircledIcon className="size-6 cursor-pointer" />,
    content: 'This is a tooltip, default delay 300ms to display',
  },
};
