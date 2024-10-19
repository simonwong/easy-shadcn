import { cn } from '@easy-shadcn/utils';
import React, { ReactNode } from 'react';
import {
  Card as InternalCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../components/ui/card';

export interface CardProps
  extends Omit<React.ComponentProps<typeof InternalCard>, 'title' | 'content'> {
  headerProps?: React.ComponentProps<typeof CardHeader>;
  title?: ReactNode;
  titleProps?: React.ComponentProps<typeof CardTitle>;
  description?: ReactNode;
  descriptionProps?: React.ComponentProps<typeof CardDescription>;
  content?: ReactNode;
  contentProps?: React.ComponentProps<typeof CardContent>;
  footer?: ReactNode;
  footerProps?: React.ComponentProps<typeof CardFooter>;
}

export const Card: React.FC<CardProps> = ({
  headerProps,
  title,
  titleProps,
  description,
  descriptionProps,
  content,
  contentProps,
  footer,
  footerProps,
  ...resetProps
}) => {
  return (
    <InternalCard {...resetProps} className={cn('py-6 space-y-6', resetProps?.className)}>
      {(title || description) && (
        <CardHeader {...headerProps} className={cn('px-6 py-0', headerProps?.className)}>
          {title && <CardTitle {...titleProps}>{title}</CardTitle>}
          {description && <CardDescription {...descriptionProps}>{description}</CardDescription>}
        </CardHeader>
      )}
      {content && (
        <CardContent {...contentProps} className={cn('px-6 py-0', contentProps?.className)}>
          {content}
        </CardContent>
      )}
      {footer && (
        <CardFooter {...footerProps} className={cn('px-6 py-0', footerProps?.className)}>
          {footer}
        </CardFooter>
      )}
    </InternalCard>
  );
};
