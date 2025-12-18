import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { Modal } from '@/registry/ui/modal';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions}>
      <Modal.Provider>{children}</Modal.Provider>
    </HomeLayout>
  );
}
