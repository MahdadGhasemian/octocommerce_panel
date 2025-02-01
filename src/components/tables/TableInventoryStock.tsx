// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import { useTheme, useMediaQuery } from '@mui/material'

// ** MaterialReactTable Imports
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_FullScreenToggleButton,
  MRT_PaginationState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton
} from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Services Import
import BasicService, { StockData } from '@/services/basic.service'

// ** Import libraries
import ExportButton from '../ExportButton'
import { InputColumnFiltersModel } from '@/services/param'

const TableInventoryStock = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  //data and fetching state
  const [data, setData] = useState<StockData[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)

  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: 'id',
      desc: true
    }
  ])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true)
      } else {
        setIsRefetching(true)
      }

      try {
        const response = await BasicService.getInventoryStock(
          pagination.pageSize,
          pagination.pageIndex + 1,
          globalFilter,
          columnFilters as InputColumnFiltersModel[],
          sorting
        )

        setData(response.data)
        setRowCount(response.meta.totalItems)
      } catch (error) {
        setIsError(true)
      }
      setIsError(false)
      setIsLoading(false)
      setIsRefetching(false)
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting])

  const columns = useMemo<MRT_ColumnDef<StockData>[]>(
    () => [
      {
        accessorKey: 'warehouse_title',
        header: 'نام انبار',
        size: 140,
        exportData: {
          width: 20
        }
      },

      {
        accessorKey: 'product_code',
        header: 'کد کالا',
        size: 140,
        exportData: {
          width: 20
        }
      },
      {
        accessorKey: 'product_name',
        header: 'نام کالا',
        size: 240,
        exportData: {
          width: 20
        }
      },
      {
        accessorKey: 'total_quantity',
        header: 'موجودی (تعداد)',
        size: 140,
        exportData: {
          width: 20
        }
      }
    ],
    []
  )

  const handleFetchAllData = async () => {
    return BasicService.getInventoryStock().then(data => data.data)
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableRowSelection={false}
        initialState={{
          showColumnFilters: false
        }}
        positionActionsColumn='last'
        enableHiding={false}
        enablePinning={false}
        manualFiltering
        manualPagination
        manualSorting
        muiToolbarAlertBannerProps={
          isError
            ? {
                color: 'error',
                children: 'خطا در دریافت اطلاعات'
              }
            : undefined
        }
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        rowCount={rowCount}
        state={{
          columnFilters,
          globalFilter,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isRefetching,
          sorting
        }}
        localization={MRT_Localization_FA}
        muiTableBodyRowProps={{
          sx: theme => ({
            background: theme.palette.background.paper
          })
        }}
        muiTableBodyCellProps={({}) => ({
          sx: {
            // fontWeight: 600,
            // fontSize: '0.980rem'
          }
        })}
        enableColumnOrdering
        renderToolbarInternalActions={({ table }) => (
          <>
            <MRT_ToggleGlobalFilterButton table={table} />
            <MRT_ToggleFiltersButton table={table} />
            {!isSmallScreen && <MRT_ShowHideColumnsButton table={table} />}
            {!isSmallScreen && <MRT_ToggleDensePaddingButton table={table} />}
            <MRT_FullScreenToggleButton table={table} />
            <ExportButton
              selectedData={data}
              columns={columns}
              filePreName='inventory_items'
              fetchData={handleFetchAllData}
            />
          </>
        )}
      />
    </>
  )
}

export default TableInventoryStock
