import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

export const Card = ({ children, className, ...props }) => {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={clsx(styles.title, className)} {...props}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  );
};
