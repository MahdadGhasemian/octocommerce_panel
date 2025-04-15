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
  useMediaQuery,
  useTheme,
  Checkbox,
  FormControlLabel,
  Typography,
  Chip
} from '@mui/material'

// ** Icons Imports
import { Delete, Pencil } from 'mdi-material-ui'

// ** MaterialReactTable Imports
import MaterialReactTable, {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState
} from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Services Import
import AuthService, { Access } from '@/services/auth.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'
import AccessDialog from '../AccessDialog'
import { SecurityOutlined } from '@mui/icons-material'

// ** Component Imports
import ColorPicker from '@/components/ColorPicker'
import { InputColumnFiltersModel } from '@/services/param'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableAccess = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<Access[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string
  }>({})
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAccess, setSelectedAccess] = useState<Access>()
  const [editRowData, setEditRowData] = useState<Access | null>(null)
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
        const response = await AuthService.getAllAccess(
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

  const handleCreateNewOrEditRow = async (values: Access) => {
    try {
      const access = Object.assign(values)

      if (editMode) {
        await AuthService.editAccess(Number(values.id), access)
      } else {
        await AuthService.createAccess(access)
      }

      setRefreshKey(key => key + 1)
    } catch (error) { }
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Access>) => {
    const id: number = row.getValue('id')
    const name = row.original.title

    if (id) {
      confirm({ groupName: 'دسترسی', name })
        .then(async () => {
          try {
            await AuthService.deleteAccess(id)

            setRefreshKey(key => key + 1)
          } catch (error) { }
        })
        .catch()
    }
  }, [])

  const handleInfoEndpoints = useCallback(async (row: MRT_Row<Access>) => {
    setSelectedAccess(row.original)
    setIsOpen(true)
  }, [])

  const handleEditModal = (row: MRT_Row<Access>) => {
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

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<Access>): MRT_ColumnDef<Access>['muiTableBodyCellEditTextFieldProps'] => {
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

  const columns = useMemo<MRT_ColumnDef<Access>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'کد',
        enableEditing: false,
        enableColumnOrdering: false,
        size: 80,
        exportData: {
          width: 10
        }
      },
      {
        accessorKey: 'title',
        header: 'عنوان',
        size: 200,
        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{renderedCellValue}</span>
          </Box>
        ),
        exportData: {
          width: 20
        }
      },
      {
        accessorKey: 'color',
        header: 'رنگ',
        Cell: ({ cell }) => <Box>{<Chip style={{ backgroundColor: `${cell.getValue<string>()}` }} />}</Box>,
        size: 80
      },
      {
        accessorKey: 'has_full_access',
        header: 'دسترسی کامل',
        enableEditing: true,
        enableColumnOrdering: true,
        Cell: ({ cell }) => <Checkbox checked={Boolean(cell.getValue())} />,
        exportData: {
          width: 10
        }
      },
      {
        accessorKey: 'is_internal_user',
        header: 'کاربر داخلی',
        enableEditing: true,
        enableColumnOrdering: true,
        Cell: ({ cell }) => <Checkbox checked={Boolean(cell.getValue())} />,
        exportData: {
          width: 10
        }
      },
      {
        accessorKey: 'description',
        header: 'توضیح',
        size: 200,
        exportData: {
          width: 20
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      }
    ],
    [getCommonEditTextFieldProps]
  )

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
          showColumnFilters: false,
          expanded: true
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
        enableColumnOrdering
        enableEditing
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Tooltip arrow placement='top' title='اصلاح'>
              <IconButton onClick={() => handleEditModal(row)}>
                <Pencil />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='top' title='جزییات دسترسی'>
              <IconButton
                color='warning'
                onClick={() => handleInfoEndpoints(row)}
                disabled={row.getValue('has_full_access')}
              >
                <SecurityOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='top' title='حذف'>
              <IconButton color='error' onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <ButtonStyled
            component='label'
            variant='contained'
            onClick={() => handleAddModal()}
            size={isSmallScreen ? 'small' : 'large'}
          >
            افزودن سطح دسترسی جدید
          </ButtonStyled>
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
      {selectedAccess ? <AccessDialog access={selectedAccess} open={isOpen} onClose={() => setIsOpen(false)} /> : <></>}
    </>
  )
}

interface CreateEditModalProps {
  columns: MRT_ColumnDef<Access>[]
  onClose: () => void
  onSubmit: (values: Access) => void
  open: boolean
  editRowData: Access | null
  editMode: boolean
}

export const CreateEditModal = ({ open, columns, onClose, onSubmit, editRowData, editMode }: CreateEditModalProps) => {
  const default_values = {
    title: '',
    description: '',
    image: '',
    color: '#FFFFFF',
    has_full_access: false,
    is_internal_user: false,
    notification_order_created: false,
    notification_payment_created: false,
    notification_delivery_created: false,
    endpoints: []
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
      JSON.parse(
        JSON.stringify({
          ...values,
          has_full_access: values.has_full_access === '' ? false : values.has_full_access,
          is_internal_user: values.is_internal_user === '' ? false : values.is_internal_user,
          notification_order_created:
            values.notification_order_created === '' ? false : values.notification_order_created,
          notification_payment_created:
            values.notification_payment_created === '' ? false : values.notification_payment_created,
          notification_delivery_created:
            values.notification_delivery_created === '' ? false : values.notification_delivery_created
        })
      )
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
      <DialogTitle textAlign='center'>اطلاعات سطوح دسترسی</DialogTitle>
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
                [
                  'has_full_access',
                  'is_internal_user',
                  'notification_order_created',
                  'notification_payment_created',
                  'notification_delivery_created'
                ].includes(String(column.accessorKey)) ? (
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
                ) : column.accessorKey === 'color' ? (
                  <ColorPicker
                    key={column.accessorKey}
                    label='انتخاب رنگ'
                    onColorSelected={(color: { target: { value: any } }) => setValues({ ...values, color })}
                    defaultValue={values[column.accessorKey]}
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

export default TableAccess
