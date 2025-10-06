import { cn } from '../../utils/cn';

const Table = ({ children, className, ...props }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
    <div className="overflow-x-auto">
      <table className={cn("min-w-full divide-y divide-slate-200 dark:divide-slate-700", className)} {...props}>
        {children}
      </table>
    </div>
  </div>
);

const TableHeader = ({ children, className, ...props }) => (
  <thead className={cn("bg-slate-50 dark:bg-slate-800", className)} {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, className, ...props }) => (
  <tbody className={cn("bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700", className)} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, className, ...props }) => (
  <tr className={cn("hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors", className)} {...props}>
    {children}
  </tr>
);

const TableHead = ({ children, className, ...props }) => (
  <th className={cn("px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider", className)} {...props}>
    {children}
  </th>
);

const TableCell = ({ children, className, ...props }) => (
  <td className={cn("px-6 py-4 whitespace-nowrap", className)} {...props}>
    {children}
  </td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };