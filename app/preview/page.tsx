import { Button } from '@/components/ui/button';
import { Card } from '@/registry/ui/card';
import { Tabs } from '@/registry/ui/tabs';

const CompositePreview = () => {
  return (
    <div>
      <Tabs
        className="max-w-sm"
        defaultValue="login"
        option={[
          {
            title: 'Login',
            value: 'login',
            content: (
              <Card
                action={<div>Extra</div>}
                className="w-80"
                description="Card Description"
                footer={<Button>Hi</Button>}
                footerClassName="flex justify-end"
                title="Login"
              >
                Card Content, Card Content, Card Content, Card Content
              </Card>
            ),
          },
          {
            title: 'Signup',
            value: 'signup',
            content: (
              <Card title="Signup Card">
                Card Content, Card Content, Card Content, Card Content
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default CompositePreview;
