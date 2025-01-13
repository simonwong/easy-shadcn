import { GitHubLogoIcon, FigmaLogoIcon, CookieIcon } from '@radix-ui/react-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from '../index';

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    menu: [
      {
        name: 'Profile',
        key: 'profile',
        shortcut: '⇧⌘P',
        onClick: () => {
          console.log('Profile');
        },
      },
      {
        name: 'Billing',
        key: 'billing',
        shortcut: '⌘B',
        onClick: () => {
          console.log('Billing');
        },
      },
      {
        groupName: 'More',
        key: 'more',
        items: [
          {
            prefix: <GitHubLogoIcon style={{ width: '16px', height: '16px' }} />,
            name: 'Github',
            key: 'github',
          },
          {
            prefix: <FigmaLogoIcon style={{ width: '16px', height: '16px' }} />,
            name: 'Support',
            key: 'support',
          },
          {
            prefix: <CookieIcon style={{ width: '16px', height: '16px' }} />,
            name: 'API',
            key: 'api',
            disabled: true,
          },
        ],
      },
      {
        name: 'Log Out',
        key: 'logout',
        shortcut: '⇧⌘Q',
      },
    ],
    children: <div>Here</div>,
  },
};

export const AutoSeparator: Story = {
  args: {
    menu: [
      {
        groupName: 'Group1',
        key: 'Group1',
        items: [
          {
            name: 'Group1-item1',
            key: 'Group1-item1',
          },
        ],
      },
      {
        name: 'item2',
        key: 'item2',
        shortcut: '⇧⌘P',
      },
      {
        groupName: 'Group2',
        key: 'Group2',
        items: [
          {
            name: 'Group2-item1',
            key: 'Group2-item1',
          },
          {
            name: 'Group2-item2',
            key: 'Group2-item2',
          },
        ],
      },
      {
        groupName: 'Group3',
        key: 'Group3',
        items: [
          {
            name: 'Group3-item1',
            key: 'Group3-item1',
          },
          {
            name: 'Group3-item2',
            key: 'Group3-item2',
          },
        ],
      },
    ],
    children: <div>AutoSeparator</div>,
  },
};

export const SubMenu: Story = {
  args: {
    menu: [
      {
        name: 'item1',
        key: 'item1',
      },
      {
        name: 'item2',
        key: 'item2',
        subItems: [
          {
            name: 'sub1-item1',
            key: 'sub1-item1',
          },
          {
            name: 'sub1-item2',
            key: 'sub1-item2',
            subItems: [
              {
                name: 'sub2-item1',
                key: 'sub2-item1',
              },
              {
                name: 'sub2-item2',
                key: 'sub2-item2',
              },
              {
                groupName: 'sub2-group',
                key: 'sub2-group',
                items: [
                  {
                    name: 'sub2-group-item1',
                    key: 'sub2-group-item1',
                  },
                  {
                    name: 'sub2-group-item2',
                    key: 'sub2-group-item2',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'item3',
        key: 'item3',
      },
    ],
    children: <div>SubMenu</div>,
  },
};
