// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import { useTheme, useMediaQuery, Box } from '@mui/material'

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
import BasicService, { TransactionNote, TransactionType, WalletTransaction } from '@/services/basic.service'

// ** Import libraries
import moment from 'moment-jalaali'
import ExportButton from '../ExportButton'
import { InputColumnFiltersModel } from '@/services/param'

const typeInformation = (transactionNote: TransactionNote, wallet_transaction: Partial<WalletTransaction>): string => {
  const order_invoice_number = wallet_transaction?.order?.order_invoice_number

  if (transactionNote === TransactionNote.DiscountProfit) {
    return order_invoice_number ? `سود خرید بابت سفارش ${order_invoice_number}` : `سود خرید`
  }

  return ''
}

const TableWalletTransaction = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  //data and fetching state
  const [data, setData] = useState<WalletTransaction[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)

  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: 'created_at',
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
        const response = await BasicService.getAllWalletTransaction(
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

  const columns = useMemo<MRT_ColumnDef<WalletTransaction>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'id',
        header: 'ردیف',
        enableEditing: false,
        enableColumnOrdering: false,
        size: 80,
        exportData: {
          width: 5
        }
      },
      {
        accessorKey: 'user',
        header: 'کاربر',
        accessorFn: row => `${row?.user?.first_name || ''} ${row?.user?.last_name || ''}`,
        id: 'user',
        size: 240,
        exportData: {
          width: 25,
          accessorFn: (row: Partial<WalletTransaction>) =>
            `${row?.user?.first_name || ''} ${row?.user?.last_name || ''}`
        }
      },
      {
        accessorKey: 'created_at',
        header: 'زمان',
        accessorFn: row => moment(row.created_at).format('jYYYY/jMM/jDD HH:mm:ss'),
        size: 140,
        exportData: {
          width: 40,
          accessorFn: (row: Partial<WalletTransaction>) => moment(row.created_at).format('jYYYY/jMM/jDD HH:mm:ss')
        }
      },
      {
        accessorKey: 'amount',
        header: 'مبلغ',
        accessorFn: row =>
          `${new Intl.NumberFormat().format(row?.amount || 0)} ${
            row.transaction_type === TransactionType.Credit ? '+' : '-'
          }`,
        size: 200,
        exportData: {
          width: 20,
          accessorFn: (row: Partial<WalletTransaction>) =>
            `${new Intl.NumberFormat().format(row?.amount || 0)} ${
              row.transaction_type === TransactionType.Credit ? '+' : '-'
            }`
        }
      },
      {
        accessorKey: 'order.order_invoice_number',
        header: 'شماره سفارش',
        enableEditing: false,
        enableColumnOrdering: false,
        size: 80,
        exportData: {
          width: 5
        }
      },
      {
        accessorKey: 'transaction_note',
        header: 'نوع',
        Cell: ({ cell, row }) => <Box>{typeInformation(cell.getValue<TransactionNote>(), row?.original)}</Box>,
        size: 280,
        exportData: {
          width: 40,
          accessorFn: (row: Partial<WalletTransaction>) =>
            row?.transaction_note ? typeInformation(row.transaction_note, row) : ''
        }
      }
    ],
    []
  )

  const handleFetchAllData = async () => {
    return BasicService.getAllWalletTransaction().then(data => data.data)
  }

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableRowSelection={false}
      initialState={{
        showColumnFilters: false
      }}
      enableHiding={false}
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
        sorting,
        columnPinning
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
            filePreName='wallet_transactions'
            fetchData={handleFetchAllData}
          />
        </>
      )}
    />
  )
}

export default TableWalletTransaction
