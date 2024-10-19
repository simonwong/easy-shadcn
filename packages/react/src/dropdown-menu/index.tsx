import React, { ComponentProps, Fragment, PropsWithChildren, ReactNode } from 'react';
import {
  DropdownMenu as InternalDropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '../../components/ui/dropdown-menu';

interface GroupMenuItem extends ComponentProps<typeof DropdownMenuGroup> {
  groupName?: ReactNode;
  key?: string;
  groupNameProps?: ComponentProps<typeof DropdownMenuLabel>;
  items: NormalMenuItem[];
}

interface NormalMenuItem
  extends Omit<ComponentProps<typeof DropdownMenuItem>, 'children' | 'prefix'> {
  prefix?: ReactNode;
  name: ReactNode;
  key?: string;
  shortcut?: string;
  subItems?: MenuItem[];
}

type MenuItem = NormalMenuItem | GroupMenuItem;

export interface DropdownMenuProps {
  menu: MenuItem[];
  contentProps?: ComponentProps<typeof DropdownMenuContent>;
}

export const DropdownMenu: React.FC<PropsWithChildren<DropdownMenuProps>> = ({
  children,
  menu,
  contentProps,
  ...resetProps
}) => {
  const renderNormalItem = (item: NormalMenuItem, idx: number) => {
    const { subItems, name, shortcut, prefix, key, ...resetProps } = item;
    if (subItems) {
      return renderSubItem(item, idx);
    }
    return (
      <DropdownMenuItem key={key || idx} {...resetProps}>
        {prefix && <span className="mr-2">{prefix}</span>}
        {name}
        {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
      </DropdownMenuItem>
    );
  };

  const renderSubItem = (menu: NormalMenuItem, idx: number) => {
    if (!menu.subItems || menu.subItems.length === 0) {
      return null;
    }
    return (
      <DropdownMenuSub key={menu.key || idx}>
        <DropdownMenuSubTrigger>{menu.name}</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>{renderMenuItem(menu.subItems)}</DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  };

  const renderGroupItem = (
    group: GroupMenuItem,
    groupIdx: number,
    separatorConf: {
      total: number;
      nextIsGroup: boolean;
    }
  ) => {
    const { groupName, key, groupNameProps, items, ...resetProps } = group;
    return (
      <Fragment key={key || groupIdx}>
        {groupIdx !== 0 && <DropdownMenuSeparator />}
        {groupName && (
          <>
            <DropdownMenuLabel {...groupNameProps}>{groupName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup {...resetProps}>
          {items.map((item, idx) => renderNormalItem(item, idx))}
        </DropdownMenuGroup>
        {separatorConf.nextIsGroup == false && separatorConf.total !== groupIdx + 1 && (
          <DropdownMenuSeparator />
        )}
      </Fragment>
    );
  };

  const renderMenuItem = (menu: MenuItem[]) => {
    return menu.map((item, idx) => {
      if ('name' in item) {
        return renderNormalItem(item, idx);
      }
      if ('items' in item) {
        return renderGroupItem(item, idx, {
          total: menu.length,
          nextIsGroup: menu[idx + 1] ? 'items' in menu[idx + 1] : false,
        });
      }
      return null;
    });
  };

  return (
    <InternalDropdownMenu {...resetProps}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent {...contentProps}>{renderMenuItem(menu)}</DropdownMenuContent>
    </InternalDropdownMenu>
  );
};
