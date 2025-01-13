import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../index';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    options: [
      {
        label: 'Opt1',
        value: '1',
      },
      {
        label: 'Opt2',
        value: '2',
      },
    ],
    width: 200,
  },
};

export const CanNotClear: Story = {
  args: {
    options: [
      {
        label: 'Opt1',
        value: '1',
      },
      {
        label: 'Opt2',
        value: '2',
      },
    ],
    width: 200,
    allowClear: false,
  },
};

export const LongOptionUnLimitWidth: Story = {
  args: {
    options: [
      {
        label: 'Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1',
        value: '1',
      },
      {
        label: 'Opt2',
        value: '2',
      },
    ],
    allowClear: false,
    placeholder: 'Select an long long long long option',
  },
};

export const LongOptionLimitWidth: Story = {
  args: {
    options: [
      {
        label: 'Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1Opt1',
        value: '1',
      },
      {
        label: 'Opt2',
        value: '2',
      },
    ],
    width: 200,
    allowClear: false,
    placeholder: 'Select an long long long long option',
  },
};

export const NumberValOption: Story = {
  args: {
    options: [
      {
        label: 'Opt1',
        value: 1,
      },
      {
        label: 'Opt2',
        value: 2,
      },
    ],
    width: 200,
  },
};

export const Multiple: Story = {
  args: {
    options: [
      {
        label: 'Opt1',
        value: 1,
      },
      {
        label: 'Opt2',
        value: 2,
      },
      {
        label: 'Opt3',
        value: 3,
      },
      {
        label: 'Opt4',
        value: 4,
      },
      {
        label: 'Opt5',
        value: 5,
      },
    ],
    width: 200,
    multiple: true,
    allowClear: true,
    placeholder: 'Select multiple options',
  },
};
