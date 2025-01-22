import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Form, FormItem } from '../../form';
import { Modal } from '../index';

const meta = {
  title: 'Components/modal/modalHelper',
  component: Modal.Provider,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Modal.Provider>;

export default meta;
type Story = StoryObj<typeof meta>;

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  remark: z.string(),
});

const HelpFormModal = Modal.create(() => {
  const { modalProps, hide } = Modal.useModal();
  const form = Form.useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      remark: '',
    },
  });

  return (
    <Modal
      title="Form Title"
      {...modalProps}
      content={
        <Form form={form} className="space-y-4">
          <FormItem
            control={form.control}
            name="username"
            label="User Name"
            render={({ field }) => <Input placeholder="shadcn" {...field} />}
          />
          <FormItem
            control={form.control}
            name="remark"
            label="Remark"
            render={({ field }) => <Input placeholder="shadcn" {...field} />}
          />
        </Form>
      }
      footer={
        <div>
          <Button
            onClick={form.handleSubmit((data) => {
              console.log('data', data);

              void hide();
            })}
          >
            Confirm
          </Button>
        </div>
      }
    />
  );
});

export const FormModal: Story = {
  render: () => {
    return (
      <Modal.Provider>
        <Button
          onClick={() => {
            void Modal.show(HelpFormModal);
          }}
        >
          Click Oen Modal
        </Button>
      </Modal.Provider>
    );
  },
  args: {},
};

const UpdateCountModal = Modal.create(({ count }: { count: number }) => {
  const { modalProps, hide } = Modal.useModal();

  console.log('UpdateCountModal modalProps :>> ', modalProps);
  return (
    <Modal
      title="Form Title"
      {...modalProps}
      content={<div>Wrapper Count: {count}</div>}
      footer={[
        <Button variant="outline" key="cancel" onClick={() => void hide()}>
          Cancel
        </Button>,
        <Button key="confirm" onClick={() => void hide()}>
          Confirm
        </Button>,
      ]}
    />
  );
});

export const UpdateDepModal: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    const [actions, ModalHolder] = Modal.useModalHolder(UpdateCountModal);

    useEffect(() => {
      setInterval(() => {
        setCount((c) => c + 1);
      }, 1000);
    }, []);

    return (
      <Modal.Provider>
        <Button
          onClick={() => {
            void actions.show();
          }}
        >
          Open Modal
        </Button>
        <div>Wrapper Count: {count}</div>
        <ModalHolder count={count} />
      </Modal.Provider>
    );
  },
  args: {},
};
