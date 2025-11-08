import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  searchable = true,
  filterable = true,
  className = '',
  title = 'Data Table',
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  filterOnlyColumns = [] // Additional filter columns that don't appear in the table
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          const column = columns.find(col => col.key === key)
          const itemValue = item[key]

          // If column has filterValueMap, use it to map display value back to data value
          if (column?.filterValueMap) {
            const dataValue = column.filterValueMap[value]
            return itemValue === dataValue
          }

          // Otherwise, use direct comparison
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase())
          }
          return itemValue === value
        })
      }
    })

    return filtered
  }, [data, searchTerm, filters])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = sortedData.slice(startIndex, endIndex)

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Get unique values for filter options
  const getFilterOptions = (key) => {
    const column = columns.find(col => col.key === key)

    // If column has custom filter options, use them
    if (column?.filterOptions) {
      return column.filterOptions
    }

    // Otherwise, get unique values from data
    const values = [...new Set(data.map(item => item[key]))]
    return values.filter(value => value !== null && value !== undefined)
  }

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 pt-4">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {filterable && (columns.length > 0 || filterOnlyColumns.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {/* Filter columns from visible table columns */}
              {columns
                .filter(col => col.filterable === true)
                .map((col) => (
                  <div key={col.key} className="flex items-center space-x-2">
                    <Select
                      value={filters[col.key] || 'all'}
                      onValueChange={(value) => handleFilterChange(col.key, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={col.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {col.label}</SelectItem>
                        {getFilterOptions(col.key).map((value) => (
                          <SelectItem key={value} value={value}>
                            {String(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              {/* Filter-only columns (not visible in table) */}
              {filterOnlyColumns.map((col) => (
                <div key={col.key} className="flex items-center space-x-2">
                  <Select
                    value={filters[col.key] || 'all'}
                    onValueChange={(value) => handleFilterChange(col.key, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={col.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {col.label}</SelectItem>
                      {getFilterOptions(col.key).map((value) => (
                        <SelectItem key={value} value={value}>
                          {String(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2">
        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${col.sortable !== false ? 'hover:bg-muted/50' : ''
                      }`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{col.label}</span>
                      {col.sortable !== false && sortConfig.key === col.key && (
                        <Badge variant="secondary" className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && <PaginationControls />}
      </CardContent>
    </Card>
  )
}

export default DataTable
