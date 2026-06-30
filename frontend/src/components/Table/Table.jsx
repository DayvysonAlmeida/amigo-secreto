import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import styles from './Table.module.css';

export const TableContainer = ({ children, className }) => {
  return <div className={`${styles.tableContainer} ${className || ''}`}>{children}</div>;
};

export const Table = ({ children, className }) => {
  return <table className={`${styles.table} ${className || ''}`}>{children}</table>;
};

export const TableHead = ({ children }) => {
  return <thead className={styles.thead}>{children}</thead>;
};

export const TableBody = ({ children }) => {
  return <tbody className={styles.tbody}>{children}</tbody>;
};

export const TableRow = ({ children }) => {
  return <tr className={styles.tr}>{children}</tr>;
};

export const TableHeader = ({ children }) => {
  return <th className={styles.th}>{children}</th>;
};

export const TableCell = ({ children }) => {
  return <td className={styles.td}>{children}</td>;
};
