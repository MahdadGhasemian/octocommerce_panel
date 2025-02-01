// ** React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import { Box, Tooltip, IconButton, Button, styled, ButtonProps, useTheme, useMediaQuery } from '@mui/material'

// ** Icons Imports
import { Delete, Pencil, Plus } from 'mdi-material-ui'

// ** MaterialReactTable Imports
import MaterialReactTable, {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_FullScreenToggleButton,
  MRT_PaginationState,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTableProps
} from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Services Import
import BasicService, { InventoryItem, InventoryType, MaterialUnit, OperatorType } from '@/services/basic.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'

// ** Import libraries
import moment from 'moment-jalaali'
import ExportButton from '../ExportButton'
import { InputColumnFiltersModel } from '@/services/param'

// ** Map Types Imports
import { InventoryTypeMap, MaterialUnitMap, OperatorTypeMap } from '@/map-types'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

export type Props = {
  inventory_type: string
}

const TableInventoryItem = (props: Props) => {
  // ** Props
  const { inventory_type } = props

  // ** Hook
  const router = useRouter()
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const newButtonText =
    inventory_type === InventoryType.Input
      ? 'سند جدید'
      : inventory_type === InventoryType.Output
      ? 'حواله جدید'
      : 'حواله انتقال جدید'
  const invenotryNumberCellText = inventory_type === InventoryType.Input ? 'شماره سند انبار' : 'شماره حواله انبار'
  const columnPinning = isSmallScreen ? {} : { left: ['inventory_date'], right: ['mrt-row-actions'] }
  const columnVisibility =
    inventory_type !== InventoryType.Transfer
      ? { 'warehouse_from.title': false, 'warehouse_to.title': false, operator_type: false }
      : undefined

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<InventoryItem[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string
  }>({})

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
        const response = await BasicService.getAllInventoryItem(
          pagination.pageSize,
          pagination.pageIndex + 1,
          globalFilter,
          columnFilters as InputColumnFiltersModel[],
          sorting,
          inventory_type
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
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, refreshKey])

  const onCreateNewInventory = () => {
    router.push(`/warehouse/inventory/${inventory_type}/new`)
  }

  const handleSaveRowEdits: MaterialReactTableProps<InventoryItem>['onEditingRowSave'] = async ({
    exitEditingMode,
    values
  }) => {
    if (!Object.keys(validationErrors).length) {
      try {
        await BasicService.editInventoryItem(values.id, { ...values, quantity: Number(values.quantity) })

        setRefreshKey(key => key + 1)
      } catch (error) {}

      exitEditingMode()
    }
  }

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<InventoryItem>) => {
    const id: number = row.getValue('id')
    const name = String(row.original.id)
    const inventoryType = row.original.inventory.inventory_type
    const groupName = InventoryTypeMap.get(inventoryType) || 'رسید/حواله'

    if (id) {
      confirm({ groupName, name })
        .then(async () => {
          try {
            await BasicService.deleteInventoryItem(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<InventoryItem>): MRT_ColumnDef<InventoryItem>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: event => {
          const isValid = validateRequired(event.target.value)
          if (!isValid) {
            //set validation error for cell if invalid
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} نیاز می باشد.`
            })
          } else {
            //remove validation error for cell if valid
            delete validationErrors[cell.id]
            setValidationErrors({
              ...validationErrors
            })
          }
        }
      }
    },
    [validationErrors]
  )

  const columns = useMemo<MRT_ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'inventory.inventory_date',
        header: 'تاریخ',
        size: 80,
        accessorFn: row => moment(row.inventory?.inventory_date).format('jYYYY/jM/jD'),
        exportData: {
          width: 20,
          accessorFn: (row: Partial<InventoryItem>) => moment(row.inventory?.inventory_date).format('jYYYY/jMM/jDD')
        },
        enableEditing: false
      },
      {
        accessorKey: 'id',
        header: 'شماره',
        size: 120,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'warehouse.title',
        header: 'انبار',
        size: 140,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'warehouse_from.title',
        header: 'از انبار',
        size: 140,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'warehouse_to.title',
        header: 'به انبار',
        size: 140,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'operator_type',
        header: 'عملیات',
        size: 140,
        exportData: {
          width: 20,
          accessorFn: (row: Partial<InventoryItem>) =>
            row?.operator_type ? OperatorTypeMap.get(row.operator_type) : ''
        },
        Cell: ({ cell }) => <Box>{OperatorTypeMap.get(cell.getValue<OperatorType>())}</Box>,
        enableEditing: false
      },

      {
        accessorKey: 'product.product_code',
        header: 'کد کالا',
        size: 140,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'product.name',
        header: 'نام کالا',
        size: 320,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'unit',
        header: 'واحد',
        size: 120,
        exportData: {
          width: 20,
          accessorFn: (row: Partial<InventoryItem>) => (row?.unit ? MaterialUnitMap.get(row.unit) : '')
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        }),
        Cell: ({ cell }) => <Box>{MaterialUnitMap.get(cell.getValue<MaterialUnit>())}</Box>,
        enableEditing: false
      },
      {
        accessorKey: 'quantity',
        header: 'تعداد',
        size: 140,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'inventory.inventory_number',
        header: invenotryNumberCellText,
        size: 140,
        exportData: {
          width: 20
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        }),
        enableEditing: false
      },
      {
        accessorKey: 'inventory_id',
        header: 'کد سند',
        size: 140,
        exportData: {
          width: 20
        },
        enableEditing: false
      },
      {
        accessorKey: 'inventory.created_by',
        header: 'کاربر ثبت کننده',
        accessorFn: row =>
          `${row?.inventory?.created_by?.first_name || ''} ${row?.inventory?.created_by?.last_name || ''}`,
        id: 'inventory.created_by',
        size: 240,
        exportData: {
          width: 25,
          accessorFn: (row: Partial<InventoryItem>) =>
            `${row?.inventory?.created_by?.first_name || ''} ${row?.inventory?.created_by?.last_name || ''}`
        },
        enableEditing: false
      },
      {
        accessorKey: 'inventory.updated_by',
        header: 'آخرین تغییرات (کاربر)',
        accessorFn: row =>
          `${row?.inventory?.updated_by?.first_name || ''} ${row?.inventory?.updated_by?.last_name || ''}`,
        id: 'inventory.updated_by',
        size: 240,
        exportData: {
          width: 25,
          accessorFn: (row: Partial<InventoryItem>) =>
            `${row?.inventory?.updated_by?.first_name || ''} ${row?.inventory?.updated_by?.last_name || ''}`
        },
        enableEditing: false
      },
      {
        accessorKey: 'inventory.updated_at',
        header: 'آخرین تغییرات (زمان)',
        size: 240,
        accessorFn: row => moment(row.updated_at).format('jYYYY/jM/jD'),
        exportData: {
          width: 20,
          accessorFn: (row: Partial<InventoryItem>) => moment(row.updated_at).format('jYYYY/jMM/jDD')
        },
        enableEditing: false
      },
      {
        accessorKey: 'description',
        header: 'توضیحات',
        exportData: {
          width: 15
        }
      }
    ],
    [getCommonEditTextFieldProps]
  )

  const handleFetchAllData = async () => {
    return BasicService.getAllInventoryItem().then(data => data.data)
  }

  return (
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
        columnVisibility
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
      editingMode='modal'
      enableColumnOrdering
      enableEditing={inventory_type !== InventoryType.Transfer}
      onEditingRowSave={handleSaveRowEdits}
      onEditingRowCancel={handleCancelRowEdits}
      renderRowActions={({ row, table }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {inventory_type === InventoryType.Input && (
            <Tooltip arrow placement='bottom' title='اصلاح'>
              <IconButton onClick={() => table.setEditingRow(row)} sx={{ p: 0 }}>
                <Pencil />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip arrow placement='bottom' title='حذف'>
            <IconButton color='error' onClick={() => handleDeleteRow(row)} sx={{ p: 0 }}>
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
            onClick={onCreateNewInventory}
            size={isSmallScreen ? 'small' : 'large'}
          >
            {!isSmallScreen && <span>{newButtonText}</span>}
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
          <ExportButton
            selectedData={data}
            columns={columns}
            filePreName='inventory_items'
            fetchData={handleFetchAllData}
          />
        </>
      )}
    />
  )
}

const validateRequired = (value: string) => !!value.length

export default TableInventoryItem
