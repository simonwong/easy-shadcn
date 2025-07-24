import { Button } from '@/components/ui/button';
import { Card } from '@/registry/ui/card';

const Demo = () => {
  return (
    <Card
      content={
        <div>
          <div>content1-content1-content1</div>
          <div>content2</div>
          <div>content3</div>
        </div>
      }
      description="some descriptions"
      footer={<Button>Button</Button>}
      footerProps={{
        style: {
          display: 'flex',
          justifyContent: 'end',
        },
      }}
      style={{ width: '300px' }}
      title="Default Card"
    />
  );
};

export default Demo;
