"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useId } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  Popover as PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ClickRootProps = ComponentProps<typeof PopoverRoot>;
type ClickTriggerProps = ComponentProps<typeof PopoverTrigger>;
type ClickContentProps = ComponentProps<typeof PopoverContent>;
type HoverRootProps = ComponentProps<typeof HoverCard>;
type HoverTriggerProps = ComponentProps<typeof HoverCardTrigger>;
type HoverContentProps = ComponentProps<typeof HoverCardContent>;

interface PopoverSlotProps {
  children: ReactElement;
  content: ReactNode;
  contentClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  headerClassName?: string;
  title?: ReactNode;
  titleClassName?: string;
}

export type PopoverClickProps = PopoverSlotProps &
  Omit<
    ClickContentProps,
    "children" | "content" | "dangerouslySetInnerHTML" | "title"
  > &
  Pick<ClickRootProps, "defaultOpen" | "onOpenChange" | "open"> & {
    /** Available only in click mode; Preview Card triggers have no disabled contract. */
    disabled?: ClickTriggerProps["disabled"];
    /** Hover close delays require `interaction="hover"`. */
    closeDelay?: never;
    /** Hover open delays require `interaction="hover"`. */
    delay?: never;
    /** Uses the click Popover adapter. Omit this prop for the same behavior. */
    interaction?: "click";
  };

export type PopoverHoverProps = PopoverSlotProps &
  Omit<
    HoverContentProps,
    "children" | "content" | "dangerouslySetInnerHTML" | "title"
  > &
  Pick<HoverRootProps, "defaultOpen" | "onOpenChange" | "open"> & {
    /** Close delay in milliseconds. Available only with `interaction="hover"`. */
    closeDelay?: HoverTriggerProps["closeDelay"];
    /** Open delay in milliseconds. Available only with `interaction="hover"`. */
    delay?: HoverTriggerProps["delay"];
    /** Click-only trigger disabling cannot be combined with hover mode. */
    disabled?: never;
    /** Uses the hover/focus Preview Card adapter and enables delay props. */
    interaction: "hover";
  };

export type PopoverProps = PopoverClickProps | PopoverHoverProps;

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

const PopoverBody = ({
  content,
  contentClassName,
  footer,
  footerClassName,
}: Pick<
  PopoverSlotProps,
  "content" | "contentClassName" | "footer" | "footerClassName"
>) => (
  <>
    {hasNode(content) && (
      <div className={contentClassName} data-slot="popover-body">
        {content}
      </div>
    )}
    {hasNode(footer) && (
      <div className={footerClassName} data-slot="popover-footer">
        {footer}
      </div>
    )}
  </>
);

const ClickPopover = ({
  children,
  content,
  contentClassName,
  title,
  titleClassName,
  description,
  descriptionClassName,
  footer,
  footerClassName,
  headerClassName,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  interaction: _interaction,
  ...contentProps
}: PopoverClickProps) => (
  <PopoverRoot
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    open={open}
  >
    <PopoverTrigger disabled={disabled} render={children} />
    <PopoverContent {...contentProps}>
      {(hasNode(title) || hasNode(description)) && (
        <PopoverHeader className={headerClassName}>
          {hasNode(title) && (
            <PopoverTitle className={titleClassName}>{title}</PopoverTitle>
          )}
          {hasNode(description) && (
            <PopoverDescription className={descriptionClassName}>
              {description}
            </PopoverDescription>
          )}
        </PopoverHeader>
      )}
      <PopoverBody
        content={content}
        contentClassName={contentClassName}
        footer={footer}
        footerClassName={footerClassName}
      />
    </PopoverContent>
  </PopoverRoot>
);

const HoverPopover = ({
  children,
  content,
  contentClassName,
  title,
  titleClassName,
  description,
  descriptionClassName,
  footer,
  footerClassName,
  headerClassName,
  open,
  defaultOpen,
  onOpenChange,
  delay,
  closeDelay,
  interaction: _interaction,
  ...contentProps
}: PopoverHoverProps) => {
  const generatedTriggerId = useId();
  const childId =
    typeof children.props === "object" &&
    children.props !== null &&
    "id" in children.props &&
    typeof children.props.id === "string"
      ? children.props.id
      : undefined;
  const triggerId = childId ?? generatedTriggerId;

  return (
    <HoverCard
      defaultOpen={defaultOpen}
      defaultTriggerId={defaultOpen ? triggerId : undefined}
      onOpenChange={onOpenChange}
      open={open}
      triggerId={open === undefined ? undefined : triggerId}
    >
      <HoverCardTrigger
        closeDelay={closeDelay}
        data-slot="popover-trigger"
        delay={delay}
        id={triggerId}
        render={children}
      />
      <HoverCardContent {...contentProps} data-slot="popover-content">
        {(hasNode(title) || hasNode(description)) && (
          <div
            className={cn("flex flex-col gap-0.5 text-sm", headerClassName)}
            data-slot="popover-header"
          >
            {hasNode(title) && (
              <div
                className={cn("font-medium", titleClassName)}
                data-slot="popover-title"
              >
                {title}
              </div>
            )}
            {hasNode(description) && (
              <div
                className={cn("text-muted-foreground", descriptionClassName)}
                data-slot="popover-description"
              >
                {description}
              </div>
            )}
          </div>
        )}
        <PopoverBody
          content={content}
          contentClassName={contentClassName}
          footer={footer}
          footerClassName={footerClassName}
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export const Popover = (props: PopoverProps) => {
  if (props.interaction === "hover") {
    return <HoverPopover {...props} />;
  }

  return <ClickPopover {...props} />;
};

export default Popover;
