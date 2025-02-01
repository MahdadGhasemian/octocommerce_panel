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
  MRT_SortingState,
  MaterialReactTableProps
} from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Services Import
import TaskService from '@/services/task.service'
import { Label } from '@/services/task.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'

// ** Component Imports
import ColorPicker from '@/components/ColorPicker'
import { InputColumnFiltersModel } from '@/services/param'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableLabel = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<Label[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [createModalOpen, setCreateModalOpen] = useState(false)
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
        const response = await TaskService.getAllLabel(
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

  const handleCreateNewRow = async (values: Label) => {
    try {
      await TaskService.createLabel(Object.assign(values))

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleSaveRowEdits: MaterialReactTableProps<Label>['onEditingRowSave'] = async ({
    exitEditingMode,
    values
  }) => {
    if (!Object.keys(validationErrors).length) {
      try {
        await TaskService.editLabel(values.id, Object.assign(values))

        setRefreshKey(key => key + 1)
      } catch (error) {}

      exitEditingMode()
    }
  }

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Label>) => {
    const id: number = row.getValue('id')
    const name = row.original.title

    if (id) {
      confirm({ groupName: 'برچسب', name })
        .then(async () => {
          try {
            await TaskService.deleteLabel(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<Label>): MRT_ColumnDef<Label>['muiTableBodyCellEditTextFieldProps'] => {
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

  const columns = useMemo<MRT_ColumnDef<Label>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '',
        enableEditing: false,
        enableColumnOrdering: false,
        size: 80
      },
      {
        accessorKey: 'title',
        header: 'عنوان',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'background_color',
        header: 'رنگ',
        Cell: ({ cell }) => <Box>{<Chip style={{ backgroundColor: `${cell.getValue<string>()}` }} />}</Box>,
        size: 80
      },
      {
        accessorKey: 'description',
        header: 'توضیح',
        size: 400
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
          sorting
        }}
        localization={MRT_Localization_FA}
        muiTableBodyRowProps={{
          sx: theme => ({
            background: theme.palette.background.paper
          })
        }}
        editingMode='modal'
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement='left' title='اصلاح'>
              <IconButton onClick={() => table.setEditingRow(row)}>
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
          <ButtonStyled
            component='label'
            variant='contained'
            onClick={() => setCreateModalOpen(true)}
            size={isSmallScreen ? 'small' : 'large'}
          >
            ایجاد برچسب جدید
          </ButtonStyled>
        )}
      />
      <CreateNewLabelModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
      />
    </>
  )
}

interface CreateModalProps {
  columns: MRT_ColumnDef<Label>[]
  onClose: () => void
  onSubmit: (values: Label) => void
  open: boolean
}

export const CreateNewLabelModal = ({ open, columns, onClose, onSubmit }: CreateModalProps) => {
  const [values, setValues] = useState<any>(() =>
    columns
      .filter(column => column.id !== 'id')
      .reduce((acc, column) => {
        acc[column.accessorKey ?? ''] = ''

        return acc
      }, {} as any)
  )

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(JSON.parse(JSON.stringify(values)))
    setValues({
      title: '',
      description: '',
      background_color: ''
    })
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>برچسب</DialogTitle>
      <DialogContent>
        <form onSubmit={e => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem',
              marginTop: 1,
              overflow: 'hidden',
              paddingY: 4
            }}
          >
            {columns
              .filter(column => column.id !== 'id')
              .map(
                column =>
                  column.accessorKey !== 'background_color' && (
                    <TextField
                      key={column.accessorKey}
                      label={column.header}
                      name={column.accessorKey}
                      onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                    />
                  )
              )}
            <ColorPicker
              label='انتخاب رنگ'
              onColorSelected={(color: { target: { value: any } }) => setValues({ ...values, background_color: color })}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>انصراف</Button>
        <ButtonStyled component='label' variant='contained' onClick={handleSubmit}>
          ذخیره
        </ButtonStyled>
      </DialogActions>
    </Dialog>
  )
}

const validateRequired = (value: string) => !!value.length

export default TableLabel
