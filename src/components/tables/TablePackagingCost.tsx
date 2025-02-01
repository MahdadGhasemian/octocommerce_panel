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
import BasicService, { PackagingCost } from '@/services/basic.service'
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

const TablePackagingCost = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<PackagingCost[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editRowData, setEditRowData] = useState<PackagingCost | null>(null)
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
        const response = await BasicService.getAllPackagingCost(
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

  const handleCreateNewOrEditRow = async (values: PackagingCost) => {
    try {
      const category = Object.assign(values)

      if (editMode) {
        await BasicService.editPackagingCost(Number(values.id), category)
      } else {
        await BasicService.createPackagingCost(category)
      }

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleEditModal = (row: MRT_Row<PackagingCost>) => {
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

  const handleDeleteRow = useCallback(async (row: MRT_Row<PackagingCost>) => {
    const id: number = row.getValue('id')
    const name = row.original.title || ''

    if (id) {
      confirm({ groupName: 'هزینه بسته بندی', name })
        .then(async () => {
          try {
            await BasicService.deletePackagingCost(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const columns = useMemo<MRT_ColumnDef<PackagingCost>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '',
        size: 80,
        exportData: {
          width: 10
        }
      },
      {
        accessorKey: 'title',
        header: 'عنوان',
        size: 200,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'cost',
        header: 'هزینه',
        size: 80,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'shared_packaging',
        header: 'قابلیت پکیج مشترک',
        Cell: ({ cell }) => <Checkbox checked={Boolean(cell.getValue())} />,
        exportData: {
          width: 10
        }
      }
    ],
    []
  )

  const handleFetchAllData = async () => {
    return BasicService.getAllPackagingCost().then(data => data.data)
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
              {!isSmallScreen && <span>افزودن هزینه بسته بندی جدید</span>}
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
              filePreName='packagingCosts'
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
  columns: MRT_ColumnDef<PackagingCost>[]
  onClose: () => void
  onSubmit: (values: PackagingCost) => void
  open: boolean
  editRowData: PackagingCost | null
  editMode: boolean
}

export const CreateEditModal = ({ open, columns, onClose, onSubmit, editRowData, editMode }: CreateEditModalProps) => {
  const default_values: PackagingCost = {
    id: 1,
    title: '',
    cost: 0,
    shared_packaging: false,
    product_packaging_costs: [],
    created_at: new Date(),
    updated_at: new Date()
  }
  const [values, setValues] = useState<PackagingCost>({ ...default_values })

  const clearData = () => {
    setValues({ ...default_values })
  }

  useEffect(() => {
    if (editRowData) {
      setValues({ ...editRowData })
    }
  }, [editRowData, editMode])

  const handleSubmit = () => {
    onSubmit(JSON.parse(JSON.stringify(Object.assign({ ...values, cost: +values.cost }))))
    clearData()
    onClose()
  }

  const handleClose = () => {
    clearData()
    onClose()
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>جزییات بسته بندی</DialogTitle>
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
              .filter(column => column.accessorKey !== 'id')
              .map(column =>
                column.accessorKey === 'shared_packaging' ? (
                  <FormControlLabel
                    key={column.accessorKey}
                    control={
                      <Checkbox
                        checked={values['shared_packaging']}
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
                    value={values[column.accessorKey as keyof PackagingCost]}
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

export default TablePackagingCost
