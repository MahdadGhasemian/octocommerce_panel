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
  useMediaQuery
} from '@mui/material'

// ** Icons Imports
import { Delete, Pencil, Plus } from 'mdi-material-ui'

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

// ** Services Import
import BasicService, { Question } from '@/services/basic.service'
import ExportButton from '../ExportButton'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'
import { InputColumnFiltersModel } from '@/services/param'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableQuestion = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<Question[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editRowData, setEditRowData] = useState<Question | null>(null)
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
        const response = await BasicService.getAllQuestion(
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

  const handleCreateNewOrEditRow = async (values: Question) => {
    try {
      const category = Object.assign(values)

      if (editMode) {
        await BasicService.editQuestion(Number(values.id), category)
      } else {
        await BasicService.createQuestion(category)
      }

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleEditModal = (row: MRT_Row<Question>) => {
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
    //
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Question>) => {
    const id: number = row.getValue('id')
    const name = row.original.question_text || ''

    if (id) {
      confirm({ groupName: 'پرسش ها', name })
        .then(async () => {
          try {
            await BasicService.deleteQuestion(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const columns = useMemo<MRT_ColumnDef<Question>[]>(
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
        accessorKey: 'question_text',
        header: 'سوال',
        size: 400,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'product',
        header: 'محصول',
        size: 200,
        exportData: {
          width: 20
        },
        Cell: ({ row }) => <Box>{row.original?.product?.name}</Box>
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
    return BasicService.getAllQuestion().then(data => data.data)
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
        editingMode='modal'
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
              {!isSmallScreen && <span>افزودن سوال جدید</span>}
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
              filePreName='questions'
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
  columns: MRT_ColumnDef<Question>[]
  onClose: () => void
  onSubmit: (values: Question) => void
  open: boolean
  editRowData: Question | null
  editMode: boolean
}

export const CreateEditModal = ({ open, columns, onClose, onSubmit, editRowData, editMode }: CreateEditModalProps) => {
  const default_values: Question = {
    id: 1,
    question_text: '',
    user_has_bought_product: false,
    created_at: new Date(),
    updated_at: new Date()
  }
  const [values, setValues] = useState<Question>({ ...default_values })

  const clearData = () => {
    setValues({ ...default_values })
  }

  useEffect(() => {
    if (editRowData) {
      setValues({ ...editRowData })
    }
  }, [editRowData, editMode])

  const handleSubmit = () => {
    onSubmit(JSON.parse(JSON.stringify(Object.assign({ ...values }))))
    clearData()
    onClose()
  }

  const handleClose = () => {
    clearData()
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>جزییات سوال</DialogTitle>
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
              .filter(column => ['question_text'].includes(String(column.accessorKey)))
              .map(column => (
                <TextField
                  key={column.accessorKey}
                  multiline
                  minRows={10}
                  label={column.header}
                  name={column.accessorKey}
                  value={values[column.accessorKey as keyof Question]}
                  onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                />
              ))}
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

export default TableQuestion
