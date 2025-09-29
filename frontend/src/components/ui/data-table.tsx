import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Download, Upload, FileDown, Filter, X, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { value: string; label: string }[];
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  onAdd?: () => void;
  onView?: (item: Record<string, React.ReactNode>) => void;
  onEdit?: (item: Record<string, React.ReactNode>) => void;
  onDelete?: (item: Record<string, React.ReactNode>) => void;

  loading?: boolean;
  selectable?: boolean;
  actionButtons?: React.ReactNode | ((selectedItems: Record<string, unknown>[]) => React.ReactNode);
  pageSize?: number;
  pageSizeOptions?: number[];
  // Novas props para o kebab menu
  baseEndpoint?: string;
  onImport?: () => void;
  onDownloadTemplate?: () => void;
  onExportCsv?: () => void;
  // Props para filtros via API
  onFiltersChange?: (filters: Record<string, string>, sortColumn: string | null, sortDirection: 'asc' | 'desc', page: number, pageSize: number) => void;
  totalItems?: number;
  currentPage?: number;
  enableApiFiltering?: boolean;
}

export const DataTable = ({
  title,
  columns,
  data,
  onAdd,
  onView,
  onEdit,
  onDelete,
  loading = false,
  selectable = false,
  actionButtons,
  pageSize = 15,
  pageSizeOptions = [10, 15, 25, 50, 100],
  baseEndpoint,
  onImport,
  onDownloadTemplate,
  onExportCsv,
  onFiltersChange,
  totalItems = 0,
  currentPage: externalCurrentPage,
  enableApiFiltering = false
}: DataTableProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<Record<string, unknown>[]>([]);
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  
  // Sincronizar estado interno com página externa quando ela mudar
  useEffect(() => {
    if (externalCurrentPage && externalCurrentPage !== currentPage) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage, currentPage]);
  
  // Estado para filtros por coluna
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Ref para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Usar dados filtrados localmente apenas se não estiver usando filtros via API
  const filteredData = enableApiFiltering 
    ? data 
    : data.filter((item) => {
        // Filtros por coluna
        const matchesColumnFilters = Object.entries(columnFilters).every(([columnKey, filterValue]) => {
          if (!filterValue) return true;
          
          const itemValue = item[columnKey];
          if (!itemValue) return false;
          
          return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
        });

        return matchesColumnFilters;
      });

  // Função de ordenação reutilizável
  const sortData = (data: Record<string, React.ReactNode>[]) => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      // Tratar valores nulos/undefined
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      // Converter para string para comparação consistente
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  };

  const sortedData = sortData(filteredData);

  // Effect para chamar a API quando filtros mudarem (apenas se enableApiFiltering estiver ativo)
  useEffect(() => {
    if (enableApiFiltering && onFiltersChange) {
      onFiltersChange(columnFilters, sortColumn, sortDirection, currentPage, currentPageSize);
    }
  }, [columnFilters, sortColumn, sortDirection, currentPage, currentPageSize, enableApiFiltering, onFiltersChange]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleColumnFilter = (columnKey: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value === "__all__" ? "" : value
    }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems([...sortedData]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (item: Record<string, unknown>, checked: boolean) => {
    let newSelectedItems;
    if (checked) {
      newSelectedItems = [...selectedItems, item];
    } else {
      newSelectedItems = selectedItems.filter(selected => {
        if (selected.id && item.id) {
          return selected.id !== item.id;
        }
        return selected !== item;
      });
    }
    setSelectedItems(newSelectedItems);
  };

  const isItemSelected = (item: Record<string, unknown>) => {
    const isSelected = selectedItems.some(selected => {
      if (selected.id && item.id) {
        return selected.id === item.id;
      }
      return selected === item;
    });
    return isSelected;
  };

  // Usar página externa se disponível
  const displayCurrentPage = externalCurrentPage || currentPage;
  
  const totalPages = enableApiFiltering 
    ? Math.ceil(totalItems / currentPageSize)
    : Math.ceil(sortedData.length / currentPageSize);
  
  // Calcular índices corretamente para ambos os modos
  const startIndex = enableApiFiltering 
    ? (displayCurrentPage - 1) * currentPageSize 
    : (displayCurrentPage - 1) * currentPageSize;
  const endIndex = enableApiFiltering 
    ? Math.min(startIndex + currentPageSize, totalItems)
    : Math.min(startIndex + currentPageSize, sortedData.length);
  
  const paginatedData = enableApiFiltering 
    ? sortedData 
    : sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Se estiver usando filtros via API, chamar a função de callback
    if (enableApiFiltering && onFiltersChange) {
      onFiltersChange(columnFilters, sortColumn, sortDirection, page, currentPageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setCurrentPageSize(size);
    setCurrentPage(1);
    // Se estiver usando filtros via API, chamar a função de callback
    if (enableApiFiltering && onFiltersChange) {
      onFiltersChange(columnFilters, sortColumn, sortDirection, 1, size);
    }
  };

  const goToFirstPage = () => {
    const page = 1;
    setCurrentPage(page);
    if (enableApiFiltering && onFiltersChange) {
      onFiltersChange(columnFilters, sortColumn, sortDirection, page, currentPageSize);
    }
  };
  
  const goToPreviousPage = () => {
    const page = Math.max(1, currentPage - 1);
    setCurrentPage(page);
    if (enableApiFiltering && onFiltersChange) {
      onFiltersChange(columnFilters, sortColumn, sortDirection, page, currentPageSize);
    }
  };
  
  const goToNextPage = () => {
    const page = Math.min(totalPages, currentPage + 1);
    setCurrentPage(page);
    if (enableApiFiltering && onFiltersChange) {
      onFiltersChange(columnFilters, sortColumn, sortDirection, page, currentPageSize);
    }
  };
  
  const goToLastPage = () => {
    const page = totalPages;
    setCurrentPage(page);
    if (enableApiFiltering && onFiltersChange) {
      onFiltersChange(columnFilters, sortColumn, sortDirection, page, currentPageSize);
    }
  };

  const handleImport = () => {
    if (onImport) {
      onImport();
    } else if (baseEndpoint) {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !baseEndpoint) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiService.createWithFormData(`${baseEndpoint}/import/`, formData);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      alert('Erro ao importar arquivo. Verifique o formato e tente novamente.');
    }
  };

  const handleDownloadTemplate = async () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
    } else if (baseEndpoint) {
      try {
        const blob = await apiService.downloadFile(`${baseEndpoint}/import/molde/`);
        
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'molde.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao baixar molde:', error);
        alert('Erro ao baixar molde.');
      }
    }
  };

  const handleExportCsv = async () => {
    if (onExportCsv) {
      onExportCsv();
    } else if (baseEndpoint) {
      try {
        const blob = await apiService.downloadFile(`${baseEndpoint}/export/csv/`);
        
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'export.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        alert('Erro ao exportar dados.');
      }
    }
  };

  // Renderizar filtro para uma coluna
  const renderColumnFilter = (column: Column) => {
    if (!column.filterable) return null;

    const filterValue = columnFilters[column.key] || '';

    switch (column.filterType) {
      case 'select':
        return (
          <Select value={filterValue || "__all__"} onValueChange={(value) => handleColumnFilter(column.key, value)}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {column.filterOptions?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={filterValue}
            onChange={(e) => handleColumnFilter(column.key, e.target.value)}
            className="h-8 w-full"
            placeholder="Filtrar data"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={filterValue}
            onChange={(e) => handleColumnFilter(column.key, e.target.value)}
            className="h-8 w-full"
            placeholder="Filtrar número"
          />
        );
      
      default: // text
        return (
          <div className="relative">
            <Input
              value={filterValue}
              onChange={(e) => handleColumnFilter(column.key, e.target.value)}
              className="h-8 w-full pr-8"
              placeholder="Filtrar"
            />
            {filterValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-8 w-8 p-0"
                onClick={() => clearColumnFilter(column.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-ifms-green-dark">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {actionButtons && selectedItems.length > 0 && (
              <div className="flex gap-2">
                {typeof actionButtons === 'function' ? actionButtons(selectedItems) : actionButtons}
              </div>
            )}
            
            {/* Botão para mostrar/ocultar filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            
            {/* Kebab menu para ações em lote */}
            {(baseEndpoint || onImport || onDownloadTemplate || onExportCsv) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Ações</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleImport} className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadTemplate} className="cursor-pointer">
                    <FileDown className="h-4 w-4 mr-2" />
                    Baixar Molde de Importe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCsv} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {onAdd && (
              <Button onClick={onAdd} className="bg-ifms-green hover:bg-ifms-green-dark">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>
        </div>
        
        {/* Filtros por coluna */}
        {showFilters && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Filtros por Coluna</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs"
              >
                Limpar Todos
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {columns.map((column) => (
                <div key={column.key} className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {column.label}
                  </label>
                  {renderColumnFilter(column)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.sortable ? "cursor-pointer hover:bg-muted" : ""}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {(onView || onEdit || onDelete) && (
                  <TableHead className="text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0) + (selectable ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ifms-green"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          key={`checkbox-${item.id || index}`}
                          checked={isItemSelected(item)}
                          onCheckedChange={(checked) => handleSelectItem(item, checked as boolean)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {item[column.key] !== undefined && item[column.key] !== null
                          ? item[column.key]
                          : "-"}
                      </TableCell>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {onView && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onView(item)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(item)}
                              title="Editar"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(item)}
                              title="Excluir"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0) + (selectable ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {enableApiFiltering 
                ? `Mostrando ${startIndex + 1}-${Math.min(endIndex, totalItems)} de ${totalItems} registros`
                : `Mostrando ${startIndex + 1}-${Math.min(endIndex, sortedData.length)} de ${sortedData.length} registros`
              }
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Linhas por página:</span>
              <Select value={currentPageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={displayCurrentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={displayCurrentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (displayCurrentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (displayCurrentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = displayCurrentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={displayCurrentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-8 h-8"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={displayCurrentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={displayCurrentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};