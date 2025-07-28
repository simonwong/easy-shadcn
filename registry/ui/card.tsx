import type React from 'react';
import type { ReactNode } from 'react';
import {
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as InternalCard,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface CardProps
  extends Omit<React.ComponentProps<typeof InternalCard>, 'title'> {
  headerClassName?: string;
  headerProps?: React.ComponentProps<typeof CardHeader>;
  title?: ReactNode;
  titleClassName?: string;
  titleProps?: React.ComponentProps<typeof CardTitle>;
  description?: ReactNode;
  descriptionClassName?: string;
  descriptionProps?: React.ComponentProps<typeof CardDescription>;
  action?: ReactNode;
  actionClassName?: string;
  actionProps?: React.ComponentProps<typeof CardAction>;
  contentClassName?: string;
  contentProps?: React.ComponentProps<typeof CardContent>;
  footer?: ReactNode;
  footerClassName?: string;
  footerProps?: React.ComponentProps<typeof CardFooter>;
}

export const Card: React.FC<CardProps> = ({
  headerClassName,
  headerProps,
  title,
  titleClassName,
  titleProps,
  description,
  descriptionClassName,
  descriptionProps,
  action,
  actionClassName,
  actionProps,
  contentClassName,
  contentProps,
  footer,
  footerClassName,
  footerProps,
  children,
  ...resetProps
}) => {
  return (
    <InternalCard {...resetProps} className={cn(resetProps?.className)}>
      {(title || description) && (
        <CardHeader
          {...headerProps}
          className={cn(headerProps?.className, headerClassName)}
        >
          {title && (
            <CardTitle
              {...titleProps}
              className={cn(titleProps?.className, titleClassName)}
            >
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription
              {...descriptionProps}
              className={cn(descriptionProps?.className, descriptionClassName)}
            >
              {description}
            </CardDescription>
          )}
          {action && (
            <CardAction
              {...actionProps}
              className={cn(actionProps?.className, actionClassName)}
            >
              {action}
            </CardAction>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent
          {...contentProps}
          className={cn(contentProps?.className, contentClassName)}
        >
          {children}
        </CardContent>
      )}
      {footer && (
        <CardFooter
          {...footerProps}
          className={cn(footerProps?.className, footerClassName)}
        >
          {footer}
        </CardFooter>
      )}
    </InternalCard>
  );
};

export default Card;
