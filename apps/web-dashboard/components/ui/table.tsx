import React from "react"

interface TableProps {
  children: React.ReactNode
  className?: string
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`table-auto w-full ${className}`}>{children}</table>
}

interface TableHeaderProps {
  children: React.ReactNode
  className?: string
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>
}

interface TableHeadProps {
  children: React.ReactNode
  className?: string
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => {
  return <th className={`px-4 py-2 text-left ${className}`}>{children}</th>
}

interface TableBodyProps {
  children: React.ReactNode
  className?: string
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export const TableCell: React.FC<TableCellProps> = ({ children, className }) => {
  return <td className={`px-4 py-2 ${className}`}>{children}</td>
}