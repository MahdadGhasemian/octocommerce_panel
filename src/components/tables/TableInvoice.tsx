// ** React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import {
  Box,
  Tooltip,
  IconButton,
  Chip,
  styled,
  ButtonProps,
  Button,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material'

// ** Icons Imports
import { Delete, Plus } from 'mdi-material-ui'

// ** MaterialReactTable Imports
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_FullScreenToggleButton,
  MRT_PaginationState,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton
} from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Redux Imports
import { isCustomerUser } from '@/redux/slices/authSlice'
import { useSelector } from 'react-redux'

// ** Services Import
import BasicService, { Order, OrderStatus, PaymentStatus } from '@/services/basic.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'

// ** Import libraries
import moment from 'moment-jalaali'
import Empty from '../Empty'
import ExportButton from '../ExportButton'
import { InputColumnFiltersModel } from '@/services/param'

const TableInvoice = () => {
  // ** Hook
  const router = useRouter()
  const theme = useTheme()

  // ** Global State
  const isUser = useSelector(isCustomerUser)

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<Order[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isEmptyData, setIsEmptyData] = useState(false)

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

  const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      textAlign: 'center'
    }
  }))

  //if you want to avoid useEffect, look at the React Query example instead
  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true)
      } else {
        setIsRefetching(true)
      }

      try {
        const response = await BasicService.getAllOrder(
          pagination.pageSize,
          pagination.pageIndex + 1,
          globalFilter,
          columnFilters as InputColumnFiltersModel[],
          sorting
        )

        setData(response.data)
        setRowCount(response.meta.totalItems)
        setIsEmptyData(!response.data?.length && !columnFilters?.length && !globalFilter?.length)
      } catch (error) {
        setIsError(true)
      }
      setIsError(false)
      setIsLoading(false)
      setIsRefetching(false)
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, refreshKey])

  const handleDeleteRow = useCallback(async (row: MRT_Row<Partial<Order>>) => {
    const id: number = row.getValue('id')
    const name = String(row.original.order_invoice_number)

    if (id) {
      confirm({ groupName: 'پیش فاکتور', name })
        .then(async () => {
          try {
            await BasicService.deleteOrder(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const handleViewRow = useCallback(async (row: MRT_Row<Partial<Order>>) => {
    const id = row.getValue('id')
    const order_invoice_number = row.getValue('order_invoice_number')

    if (id) {
      router.push(`/invoice/view?id=${id}&order_invoice_number=${order_invoice_number}`)
    }
  }, [])

  const onCreateNewInvoice = () => {
    router.push('/invoice/new')
  }

  const columns = useMemo<MRT_ColumnDef<Partial<Order>>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'کد سفارش',
        size: 80,
        exportData: {
          width: 10
        }
      },
      {
        accessorKey: 'order_invoice_number',
        header: 'شماره سفارش',
        size: 80,
        exportData: {
          width: 15
        }
      },
      {
        accessorKey: 'created_at',
        header: 'تاریخ ایجاد',
        accessorFn: row => moment(row.created_at).format('jYYYY/jM/jD'),
        id: 'created_at',
        exportData: {
          width: 20,
          accessorFn: (row: Partial<Order>) => moment(row.created_at).format('jYYYY/jMM/jDD')
        }
      },
      {
        accessorKey: 'user',
        header: 'کاربر',
        Cell: ({ row }) => (
          <Stack>
            <span>{`${row?.original?.user?.first_name || ''} ${row?.original?.user?.last_name || ''}`}</span>
            <span>{`${row?.original?.user?.mobile_phone?.replace('+98', '0')}`}</span>
          </Stack>
        ),
        id: 'user',
        size: 240,
        exportData: {
          width: 25,
          accessorFn: (row: Partial<Order>) => `${row?.user?.first_name || ''} ${row?.user?.last_name || ''}`
        }
      },
      {
        accessorKey: 'contact',
        header: 'آدرس حمل',
        accessorFn: row => `${row?.user?.last_name || ''}`,
        id: 'contact',
        size: 240,
        exportData: {
          width: 25,
          accessorFn: (row: Partial<Order>) => `${row?.user?.last_name || ''}`
        }
      },
      {
        accessorKey: 'order_status',
        header: 'وضعیت',
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue<string>() === OrderStatus.Pending ? (
              <Chip label='ثبت اولیه' color='secondary' />
            ) : cell.getValue<string>() === OrderStatus.Confirmed ? (
              <Chip label='تایید شد ' color='info' />
            ) : cell.getValue<string>() === OrderStatus.Rejected ? (
              <Chip label='رد شد ' color='error' />
            ) : (
              <></>
            )}
          </Box>
        ),
        size: 80,
        exportData: {
          width: 10,
          accessorFn: (row: Partial<Order>) =>
            `${
              row?.order_status === OrderStatus.Pending
                ? 'ثبت اولیه'
                : row?.order_status === OrderStatus.Confirmed
                ? 'تایید شد'
                : row?.order_status === OrderStatus.Rejected
                ? 'رد شد'
                : ''
            }`
        }
      },
      {
        accessorKey: 'total',
        header: 'مبلغ کل',
        id: 'total',
        size: 140,
        exportData: {
          width: 20,
          isCurrency: true,
          accessorFn: (row: Partial<Order>) => Number(row?.total)
        },
        Cell: ({ cell }) => <div>{Number(cell.getValue()).toLocaleString()}</div>
      },
      {
        accessorKey: 'payments',
        header: 'مبلغ واریزی',
        accessorFn: row =>
          row?.payments
            ?.filter(item => item.payment_status === PaymentStatus.Confirmed)
            .reduce((acc, item) => Number(acc) + Number(item?.amount), 0),
        id: 'payments',
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue<number>() >= Number(cell.row.getValue('total')) ? (
              <Chip label='پرداخت شد' color='success' />
            ) : (
              <span>{Number(cell.getValue()).toLocaleString()}</span>
            )}
          </Box>
        ),
        size: 140,
        exportData: {
          width: 20,
          isCurrency: true,
          accessorFn: (row: Partial<Order>) =>
            row?.payments
              ?.filter(item => item.payment_status === PaymentStatus.Confirmed)
              .reduce((acc, item) => Number(acc) + Number(item?.amount), 0)
        }
      },
      {
        accessorKey: 'note',
        header: 'یادداشت',
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'delivery_date',
        accessorFn: row => (row?.delivery_date ? moment(row.delivery_date).format('jYYYY/jMM/jDD') : ''),
        id: 'delivery_date',
        header: 'تاریخ تحویل',
        exportData: {
          width: 20,
          accessorFn: (row: Partial<Order>) =>
            row?.delivery_date ? moment(row.delivery_date).format('jYYYY/jMM/jDD') : ''
        }
      }

      // {
      //   accessorKey: 'order_bank_identifier_code',
      //   header: 'شناسه واریز',
      //   exportData: {
      //     width: 20
      //   }
      // }
    ],
    []
  )

  const handleFetchAllData = async () => {
    return BasicService.getAllOrder().then(data => data.data)
  }

  // if (isLoading) return <p>در حال آماده سازی اطلاعات ...</p>

  return isUser && isEmptyData ? (
    <Empty message='شما هنوز هیچ سفارشی ثبت نکرده اید' buttonText='ثبت سفارش جدید' buttonHandler={onCreateNewInvoice} />
  ) : (
    <MaterialReactTable
      displayColumnDefOptions={{
        'mrt-row-actions': {
          muiTableHeadCellProps: {
            align: 'center'
          },
          size: 80
        }
      }}
      columns={columns}
      data={data}
      enableRowSelection={false}
      initialState={{
        showColumnFilters: false,
        columnVisibility: { id: false, account: !isUser }
      }}
      positionActionsColumn='last'
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
        sorting
      }}
      localization={MRT_Localization_FA}
      muiTableBodyRowProps={({ row }) => ({
        sx: theme => ({
          background: theme.palette.background.paper,
          cursor: 'pointer'
        }),
        onClick: () => {
          handleViewRow(row)
        }
      })}
      muiTableBodyCellProps={({}) => ({
        sx: {
          // fontWeight: 600,
          // fontSize: '0.980rem'
        }
      })}
      enableColumnOrdering
      enableEditing
      renderRowActions={({ row }) => (
        <Box sx={{ display: 'flex', gap: '0.4rem' }}>
          {/* <Tooltip arrow placement='bottom' title='مشاهده'>
            <IconButton color='primary' onClick={() => handleViewRow(row)}>
              <Eye />
            </IconButton>
          </Tooltip> */}
          <Tooltip arrow placement='bottom' title='حذف'>
            <IconButton color='error' onClick={() => handleDeleteRow(row)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      renderTopToolbarCustomActions={() => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ButtonStyled
            component='label'
            variant='contained'
            onClick={onCreateNewInvoice}
            size={isSmallScreen ? 'small' : 'large'}
          >
            {!isSmallScreen && <span>پیش فاکتور جدید</span>}
            <Plus />
          </ButtonStyled>
        </Box>
      )}
      renderToolbarInternalActions={({ table }) => (
        <>
          <MRT_ToggleGlobalFilterButton table={table} />
          <MRT_ToggleFiltersButton table={table} />
          {!isSmallScreen && <MRT_ShowHideColumnsButton table={table} />}
          {!isSmallScreen && <MRT_ToggleDensePaddingButton table={table} />}
          <MRT_FullScreenToggleButton table={table} />
          <ExportButton selectedData={data} columns={columns} filePreName='invoices' fetchData={handleFetchAllData} />
        </>
      )}
    />
  )
}

export default TableInvoice
