import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Search } from 'lucide-react';

interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (value: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  searchKey,
  onEdit,
  onDelete,
  loading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = searchKey ? data.filter((item) => {
    const searchValue = item[searchKey];
    if (typeof searchValue === 'string') {
      return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  }) : data;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Auto-add actions column if edit/delete handlers are provided
  const columnsWithActions = [...columns];
  if ((onEdit || onDelete) && !columns.some(col => col.key === 'actions')) {
    columnsWithActions.push({ key: 'actions', label: 'Ações' } as Column<T>);
  }

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columnsWithActions.map((column) => (
                <TableHead key={String(column.key)}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnsWithActions.length} className="text-center py-8 text-muted-foreground">
                  Nenhum resultado encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  {columnsWithActions.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.key === 'actions' ? (
                        <div className="flex gap-2">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : column.render ? (
                        column.render(item)
                      ) : (
                        String(item[column.key as keyof T])
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}