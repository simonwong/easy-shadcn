import { Avatar } from "@/registry/ui/avatar";

const Demo = () => (
  <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
    <section className="space-y-3">
      <h3 className="font-medium text-sm">Fallback only</h3>
      <Avatar fallback="AL" />
    </section>

    <section className="space-y-3">
      <h3 className="font-medium text-sm">Image with fallback</h3>
      <Avatar
        alt="Abstract blue and purple banner"
        fallback="BN"
        size="lg"
        src="/banner.png"
      />
    </section>

    <section className="space-y-3">
      <h3 className="font-medium text-sm">Failed image</h3>
      <Avatar
        aria-label="Grace Hopper"
        fallback="GH"
        role="img"
        size="lg"
        src="/missing-avatar.png"
      />
    </section>

    <section className="space-y-3">
      <h3 className="font-medium text-sm">Caller-owned badge</h3>
      <Avatar
        aria-label="Lin Chen, online"
        badge={<span aria-hidden="true" />}
        badgeClassName="bg-emerald-500"
        fallback="LC"
        role="img"
        size="lg"
      />
    </section>

    <section className="space-y-3 sm:col-span-2">
      <h3 className="font-medium text-sm">Primitive sizes</h3>
      <div className="flex items-end gap-4">
        <Avatar aria-label="Small avatar" fallback="SM" role="img" size="sm" />
        <Avatar aria-label="Default avatar" fallback="DF" role="img" />
        <Avatar aria-label="Large avatar" fallback="LG" role="img" size="lg" />
      </div>
    </section>
  </div>
);

export default Demo;
