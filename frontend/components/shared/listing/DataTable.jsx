import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckSquare } from "lucide-react";

export function DataTable({ data, columns, emptyMessage = "No data found." }) {
  console.log(data);

  return (
    <div className="rounded-md border bg-white mt-4 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 border-b">
          <TableRow>
            <TableHead className="w-12 text-center">
              <CheckSquare className="size-4 text-slate-400 inline-block" />
            </TableHead>
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className={`font-medium text-slate-500 ${col.className || ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex} className="hover:bg-slate-50/50">
              <TableCell className="text-center">
                <div className="size-4 rounded border border-slate-300 inline-block align-middle" />
              </TableCell>
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className={col.cellClassName || ""}>
                  {col.render ? col.render(row) : row[col.accessorKey]}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
