import type React from 'react';
import type { ReactNode } from 'react';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as InternalCard,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <InternalCard {...resetProps} className={cn(resetProps?.className)}>
      {(title || description) && (
        <CardHeader {...headerProps} className={cn(headerProps?.className)}>
          {title && <CardTitle {...titleProps}>{title}</CardTitle>}
          {description && (
            <CardDescription {...descriptionProps}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      {content && (
        <CardContent {...contentProps} className={cn(contentProps?.className)}>
          {content}
        </CardContent>
      )}
      {footer && (
        <CardFooter {...footerProps} className={cn(footerProps?.className)}>
          {footer}
        </CardFooter>
      )}
    </InternalCard>
  );
};

export default Card;
