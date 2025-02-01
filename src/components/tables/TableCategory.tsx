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
  Autocomplete,
  useMediaQuery,
  useTheme
} from '@mui/material'

// ** Icons Imports
import { Delete, Pencil } from 'mdi-material-ui'

// ** MaterialReactTable Imports
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState
} from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Services Import
import BasicService, { Category, ExternalCategorySeller } from '@/services/basic.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'
import { InputColumnFiltersModel } from '@/services/param'
import CategoryExternalSeller from '../CategoryExternalSeller'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

export type TableCategoryProps = {
  categoriesFlat?: Array<Category>
}

const TableCategory = (props: TableCategoryProps) => {
  // ** Props
  const { categoriesFlat } = props

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<Category[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editRowData, setEditRowData] = useState<Category | null>(null)
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

      const _columnFilters = columnFilters.map(filter => {
        if (filter.id === 'id') {
          return {
            ...filter,
            operator: '$eq'
          }
        }

        return filter
      })

      try {
        const response = await BasicService.getAllCategoryAdmin(
          pagination.pageSize,
          pagination.pageIndex + 1,
          globalFilter,
          _columnFilters as InputColumnFiltersModel[],
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

  const handleCreateNewOrEditRow = async (values: Category) => {
    try {
      const category = Object.assign(values)

      if (editMode) {
        await BasicService.editCategory(Number(values.id), category)
      } else {
        await BasicService.createCategory(category)
      }

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleEditModal = (row: MRT_Row<Category>) => {
    setEditMode(true)
    setEditRowData(row.original)
    setTimeout(() => {
      setCreateModalOpen(true)
    }, 1)
  }

  const handleAddModal = () => {
    setEditMode(false)
    setTimeout(() => {
      setCreateModalOpen(true)
    }, 1)
  }

  const handleModalClosed = () => {
    setCreateModalOpen(false)
    setEditRowData(null)
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Category>) => {
    const id: number = row.getValue('id')
    const name = row.original.name

    if (id) {
      confirm({ groupName: 'دسته بندی', name })
        .then(async () => {
          try {
            await BasicService.deleteCategory(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'کد',
        enableEditing: false,
        enableColumnOrdering: false,
        size: 80
      },
      {
        accessorKey: 'name',
        header: 'نام',
        size: 200
      },
      {
        accessorKey: 'description',
        header: 'توضیح'
      },
      {
        accessorKey: 'parent_id',
        header: 'کد والد',
        size: 80,
        Cell: ({ cell }) => <Box>{cell.getValue<number>()}</Box>
      }
    ],
    []
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
          <ButtonStyled
            component='label'
            variant='contained'
            onClick={() => handleAddModal()}
            size={isSmallScreen ? 'small' : 'large'}
          >
            افزودن دسته بندی جدید
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
        categoriesFlat={categoriesFlat}
      />
    </>
  )
}

interface CreateEditModalProps {
  columns: MRT_ColumnDef<Category>[]
  onClose: () => void
  onSubmit: (values: Category) => void
  open: boolean
  editRowData: Category | null
  editMode: boolean
  categoriesFlat?: Array<Category>
}

export const CreateEditModal = ({
  open,
  onClose,
  onSubmit,
  editRowData,
  editMode,
  categoriesFlat
}: CreateEditModalProps) => {
  const default_values = {
    id: 1,
    name: '',
    description: '',
    image: '',
    parent_id: 1
  }
  const [values, setValues] = useState<Category>({ ...default_values })
  const [external_category_sellers, setExternalCategorySellers] = useState<ExternalCategorySeller[] | undefined>(
    editRowData?.external_category_sellers
  )

  const clearData = () => {
    setValues({ ...default_values })
    setExternalCategorySellers(undefined)
  }

  useEffect(() => {
    if (editRowData) {
      setValues({ ...editRowData })
      setExternalCategorySellers(editRowData.external_category_sellers)
    }
  }, [editRowData])

  const handleSubmit = () => {
    onSubmit(
      JSON.parse(
        JSON.stringify(
          Object.assign({ ...values }, Number(values.parent_id) >= 0 && { parent_id: Number(values.parent_id) }, {
            external_category_sellers
          })
        )
      )
    )
    clearData()
    onClose()
  }

  const handleClose = () => {
    clearData()
    onClose()
  }

  const handleChangeCategory = async (value: Category | null) => {
    if (value?.id) setValues({ ...values, parent_id: value.id })
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>اطلاعات دسته بندی</DialogTitle>
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
            {/* نام دسته بندی */}
            <TextField
              label='نام دسته بندی'
              name='name'
              value={values.name}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
            />
            {/* والد */}
            {categoriesFlat ? (
              <Autocomplete
                value={categoriesFlat?.find(c => +c.id === +values.parent_id)}
                getOptionLabel={category => `${category.name}`}
                options={categoriesFlat}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                noOptionsText={'هیچ آیتمی موجود نیست'}
                renderOption={(props, category) => (
                  <Box component='li' {...props} key={category.id}>
                    {category?.name}
                  </Box>
                )}
                renderInput={params => <TextField {...params} label='والد' />}
                onChange={(_, value) => handleChangeCategory(value)}
              />
            ) : (
              <></>
            )}
            {/* Description */}
            <TextField
              label='توضیح'
              name='description'
              value={values.description}
              onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
              multiline
            />
            {/* CategoryExternalSeller */}
            <CategoryExternalSeller
              initialExternalSellers={external_category_sellers}
              onChange={newExternalCategorySellers => setExternalCategorySellers(newExternalCategorySellers)}
            />
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

export default TableCategory
