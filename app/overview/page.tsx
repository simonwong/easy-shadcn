import { Button } from '@/components/ui/button';
import Card from '@/registry/ui/card';

const Overview = () => {
  return (
    <div>
      <Card
        action={<div>Extra</div>}
        className="w-80"
        description="Card Description"
        footer={<Button>Hi</Button>}
        footerClassName="flex justify-end"
        title="Card Title"
      >
        Card Content, Card Content, Card Content, Card Content
      </Card>
    </div>
  );
};

export default Overview;
