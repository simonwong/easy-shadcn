import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Form, FormItem } from '../index';
import { Button } from '../../button';
import { Input } from '../../input';

const meta = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => {
    const formSchema = z.object({
      username: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
      }),
    });

    const form = Form.useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
      },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values);
    }

    return (
      <Form form={form}>
        <FormItem
          control={form.control}
          name="username"
          label="User Name"
          render={({ field }) => <Input placeholder="shadcn" {...field} />}
        />
        <Button
          onClick={async () => {
            await form.handleSubmit(onSubmit)();
          }}
        >
          asd
        </Button>
      </Form>
    );
  },
};
