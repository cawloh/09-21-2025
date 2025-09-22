import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-lg">
      <table className={`min-w-full border-collapse bg-white/90 backdrop-blur-sm ${className}`}>
        {children}
      </table>
    </div>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

const TableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gradient-to-r from-wine-50 to-cream-50 ${className}`}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return <tbody className={className}>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => {
  return (
    <tr className={`
      transition-all duration-200 hover:bg-gradient-to-r hover:from-wine-50/50 
      hover:to-cream-50/50 hover:shadow-sm border-b border-gray-50 ${className}
    `}>
      {children}
    </tr>
  );
};

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className = '' }) => {
  return (
    <th className={`
      px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase 
      tracking-wider border-b border-gray-200 ${className}
    `}>
      {children}
    </th>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 text-sm text-gray-800 ${className}`}>
      {children}
    </td>
  );
};

export { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell };