import { AlertModal, Button, Form, FormItem, Input, Modal } from '@easy-shadcn/react';

const FormModal = Modal.create(({ username, remark }: { username: string; remark: string }) => {
  const form = Form.useForm({
    defaultValues: {
      username,
      remark,
    },
  });

  const modal = Modal.useModal();

  return (
    <Modal
      {...modal.modalProps}
      title="Modal Open By hooks action"
      content={
        <Form form={form} className="space-y-4">
          <FormItem
            control={form.control}
            name="username"
            label="User Name"
            render={({ field }) => <Input {...field} />}
          />
          <FormItem
            control={form.control}
            name="remark"
            label="Remark"
            render={({ field }) => <Input {...field} />}
          />
        </Form>
      }
      footer={
        <Button
          onClick={form.handleSubmit((data) => {
            void AlertModal.confirm({
              title: 'Are you sure to submit',
              content: 'Close the form pop-up after submission',
              onConfirm: () => {
                console.log('data', data);
                void modal.hide();
              },
            });
          })}
        >
          Confirm
        </Button>
      }
    />
  );
});

const Demo = () => {
  return (
    <div>
      <div>username: Simon, remark: This is a remark</div>
      <Button
        onClick={() => {
          void Modal.show(FormModal, {
            username: 'Simon',
            remark: 'This is a remark',
          });
        }}
      >
        Click Open Modal Form
      </Button>
    </div>
  );
};

export default Demo;
