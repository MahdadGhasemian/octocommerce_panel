// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import { Box, useTheme, useMediaQuery, Chip } from '@mui/material'

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
import BasicService, { ShortMessage } from '@/services/basic.service'
import ExportButton from '../ExportButton'

// ** Comnfirmation Import
import { InputColumnFiltersModel } from '@/services/param'

// ** Import libraries
import moment from 'moment-jalaali'

interface TableShortMessageProps {
  refreshKey: number
}

const TableShortMessage = (props: TableShortMessageProps) => {
  // ** Props
  const { refreshKey: parentRefreshKey } = props

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  //data and fetching state
  const [data, setData] = useState<ShortMessage[]>([])
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
        const response = await BasicService.getAllShortMessage(
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
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, parentRefreshKey])

  const columns = useMemo<MRT_ColumnDef<ShortMessage>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '',
        enableEditing: false,
        enableColumnOrdering: false,
        size: 80,
        exportData: {
          width: 10
        }
      },
      {
        accessorKey: 'created_at',
        header: 'زمان',
        accessorFn: row => moment(row.created_at).format('jYYYY/jMM/jDD HH:mm:ss'),
        size: 140,
        exportData: {
          width: 40,
          accessorFn: (row: Partial<ShortMessage>) => moment(row.created_at).format('jYYYY/jMM/jDD HH:mm:ss')
        }
      },
      {
        accessorKey: 'mobile_phone',
        header: 'شماره موبایل',
        Cell: ({ cell }) => <span dir='ltr'>{cell.getValue<string>()}</span>,
        size: 80,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'is_sent_by_system',
        header: 'ارسال شده',
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue<boolean>() === true ? (
              <Chip label='توسط سیستم' color='success' />
            ) : (
              <Chip label='از پنل' color='info' />
            )}
          </Box>
        ),
        size: 80,
        exportData: {
          width: 10,
          accessorFn: (row: Partial<ShortMessage>) => `${row?.is_sent_by_system ? 'توسط سیستم' : 'از پنل'}`
        }
      },
      {
        accessorKey: 'title_type',
        header: 'عنوان',
        size: 80,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'text_list',
        header: 'مقادیر',
        Cell: ({ cell, row }) => (
          <Box>
            {cell.getValue<string[]>()?.map((item, index) => (
              <p key={`${row.id}-text_list-${item}-${index}`}>{item}</p>
            ))}
          </Box>
        )
      },
      {
        accessorKey: 'user',
        header: 'کاربر',
        size: 200,
        exportData: {
          width: 20
        },
        Cell: ({ row }) => <Box>{`${row.original?.user?.first_name || ''} ${row.original?.user?.last_name || ''}`}</Box>
      }
    ],
    []
  )

  const handleFetchAllData = async () => {
    return BasicService.getAllShortMessage().then(data => data.data)
  }

  return (
    <>
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
          showColumnFilters: false
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
          sorting,
          columnPinning,
          density: 'compact'
        }}
        localization={MRT_Localization_FA}
        muiTableBodyRowProps={{
          sx: theme => ({
            background: theme.palette.background.paper
          })
        }}
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
              filePreName='short-messages'
              fetchData={handleFetchAllData}
            />
          </>
        )}
      />
    </>
  )
}

export default TableShortMessage
