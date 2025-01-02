import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { AlertModal } from '../index';
import ModalHelper from '../modal-helper';

const meta = {
  title: 'Components/modal/AlertModal',
  component: AlertModal,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AlertModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Button>Click Open</Button>,
    title: '提示',
    content: '点击打开，异步事件自动 loading',
    onConfirm: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      }),
  },
};

export const UseAlertModalAction: Story = {
  render: () => {
    return (
      <ModalHelper.Provider>
        <div className="space-x-2">
          <Button
            onClick={() => {
              void AlertModal.alert({
                title: 'Step1',
                content: '多层 Alert',
                onConfirm: async () => {
                  await AlertModal.alert({
                    title: 'Step1-1',
                    content: '确认',
                    onConfirm: () => {
                      console.log('111 :>> ', 111);
                    },
                  });
                },
              });
            }}
          >
            Alert Step In Step
          </Button>
          <Button
            onClick={async () => {
              await AlertModal.alert({
                title: 'Step1',
                content: 'Step1 Alert',
                onConfirm: async () =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                    }, 1000);
                  }),
              });
              await AlertModal.alert({
                title: 'Step2',
                content: 'Step2 Alert',
                onConfirm: () => {
                  console.log('Down');
                },
              });
            }}
          >
            Alert Step By Step
          </Button>
          <Button
            onClick={async () => {
              await AlertModal.alert({
                title: 'Step1',
                content: 'Step1 Alert',
                onConfirm: async () =>
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      reject(new Error('Step1 Error'));
                    }, 1000);
                  }),
              });
              await AlertModal.alert({
                title: 'Step2',
                content: 'Step2 Alert',
                onConfirm: () => {
                  console.log('Down');
                },
              });
            }}
          >
            Alert Step throw
          </Button>
          <Button
            onClick={() => {
              void AlertModal.confirm({
                title: '提示',
                content: '点击打开，异步事件自动 loading',
                onConfirm: () =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                    }, 1000);
                  }),
                onCancel: () =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                    }, 1000);
                  }),
              });
            }}
          >
            Open Confirm
          </Button>
        </div>
      </ModalHelper.Provider>
    );
  },
};
