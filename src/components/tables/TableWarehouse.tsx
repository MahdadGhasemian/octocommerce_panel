// ** React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import {
  Box,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  DialogActions,
  styled,
  ButtonProps,
  useTheme,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
  Typography
} from '@mui/material'

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
  MRT_ToggleGlobalFilterButton
} from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Services Import
import BasicService, { Warehouse } from '@/services/basic.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'

// ** Import libraries
import ExportButton from '../ExportButton'
import { InputColumnFiltersModel } from '@/services/param'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableWarehouse = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<Warehouse[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string
  }>({})
  const [editRowData, setEditRowData] = useState<Warehouse | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)

  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: 'id',
      desc: false
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
        const response = await BasicService.getAllWarehouse(
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
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, refreshKey])

  const handleEditModal = (row: MRT_Row<Warehouse>) => {
    setEditMode(true)
    setEditRowData(row.original)
    setCreateModalOpen(true)
  }

  const handleAddModal = () => {
    setEditMode(false)
    setCreateModalOpen(true)
  }

  const handleModalClosed = () => {
    setCreateModalOpen(false)
    setEditRowData(null)
  }

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const handleCreateNewOrEditRow = async (values: Warehouse) => {
    try {
      const warehouse = Object.assign(values)

      if (editMode) {
        await BasicService.editWarehouse(Number(values.id), warehouse)
      } else {
        await BasicService.createWarehouse(warehouse)
      }

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Warehouse>) => {
    const id: number = row.getValue('id')
    const name = row.original.title

    if (id) {
      confirm({ groupName: 'انبار', name })
        .then(async () => {
          try {
            await BasicService.deleteWarehouse(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<Warehouse>): MRT_ColumnDef<Warehouse>['muiTableBodyCellEditTextFieldProps'] => {
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

  const columns = useMemo<MRT_ColumnDef<Warehouse>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'کد',
        enableEditing: false,
        enableColumnOrdering: false,
        size: 80,
        exportData: {
          width: 5
        }
      },
      {
        accessorKey: 'title',
        header: 'عنوان',
        size: 200,
        exportData: {
          width: 20
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'is_virtualy',
        header: 'انبار مجازی',
        size: 80,
        Cell: ({ cell }: { cell: MRT_Cell<Warehouse> }) => (
          <Checkbox color='secondary' checked={Boolean(cell.getValue())} />
        ),
        exportData: {
          width: 10
        }
      },
      {
        accessorKey: 'address',
        header: 'آدرس',
        size: 340,
        exportData: {
          width: 40
        }
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
    return BasicService.getAllWarehouse().then(data => data.data)
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
        enableEditing
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement='left' title='اصلاح'>
              <IconButton onClick={() => handleEditModal(row)}>
                <Pencil />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='right' title='حذف'>
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
              onClick={() => handleAddModal()}
              size={isSmallScreen ? 'small' : 'large'}
            >
              {!isSmallScreen && <span>افزودن انبار جدید</span>}
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
              filePreName='warehouses'
              fetchData={handleFetchAllData}
            />
          </>
        )}
      />
      <CreateEditModal
        columns={columns}
        open={createModalOpen}
        onClose={() => handleModalClosed()}
        onSubmit={handleCreateNewOrEditRow}
        editRowData={editRowData}
        editMode={editMode}
      />
    </>
  )
}

interface CreateEditModalProps {
  columns: MRT_ColumnDef<Warehouse>[]
  onClose: () => void
  onSubmit: (values: Warehouse) => void
  open: boolean
  editRowData: Warehouse | null
  editMode: boolean
}

export const CreateEditModal = ({ open, columns, onClose, onSubmit, editRowData, editMode }: CreateEditModalProps) => {
  const default_values = {
    title: '',
    is_virtualy: false,
    address: '',
    image: '',
    description: ''
  }
  const [values, setValues] = useState<any>({ ...default_values })

  const clearData = () => {
    setValues({ ...default_values })
  }

  useEffect(() => {
    if (editRowData) {
      setValues({ ...editRowData })
    }
  }, [editRowData, editMode])

  const handleSubmit = () => {
    onSubmit(
      JSON.parse(JSON.stringify({ ...values, is_virtualy: values.is_virtualy === '' ? false : values.is_virtualy }))
    )

    clearData()
    onClose()
  }

  const handleClose = () => {
    clearData()
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>اطلاعات انبار</DialogTitle>
      <DialogContent>
        <form onSubmit={e => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem',
              marginTop: 1
            }}
          >
            {columns
              .filter(column => column.id !== 'id')
              .map(column =>
                column.accessorKey === 'is_virtualy' ? (
                  <FormControlLabel
                    key={column.accessorKey}
                    control={
                      <Checkbox
                        checked={values[column.accessorKey as any]}
                        name={column.accessorKey}
                        onChange={e => setValues({ ...values, [e.target.name]: e.target.checked })}
                      />
                    }
                    label={<Typography variant='subtitle1'>{column.header}</Typography>}
                  />
                ) : (
                  <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    value={values[column.accessorKey as any]}
                    onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                  />
                )
              )}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={handleClose}>انصراف</Button>
        <ButtonStyled component='label' variant='contained' onClick={handleSubmit}>
          {editMode ? 'ذخیره' : 'افزودن'}
        </ButtonStyled>
      </DialogActions>
    </Dialog>
  )
}

const validateRequired = (value: string) => !!value.length

export default TableWarehouse
