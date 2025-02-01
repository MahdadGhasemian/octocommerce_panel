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
  Autocomplete,
  Chip,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material'

// ** Icons Imports
import { Delete, MapMarkerDistance, Pencil, Plus } from 'mdi-material-ui'

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
import BasicService, {
  DeliveryMethod,
  DeliveryChargeType,
  DeliveryType,
  DeliveryPricingType
} from '@/services/basic.service'
import ExportButton from '../ExportButton'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'
import { InputColumnFiltersModel } from '@/services/param'
import DeliveryMethodDialog from '../DeliveryMethodDialog'

// ** Map Types Imports
import { DeliveryChargeTypeMap, DeliveryPricingTypeMap, DeliveryTypeMap } from '@/map-types'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableDeliveryMethod = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<DeliveryMethod[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod>()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editRowData, setEditRowData] = useState<DeliveryMethod | null>(null)
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
        const response = await BasicService.getAllDeliveryMethod(
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

  const handleCreateNewOrEditRow = async (values: DeliveryMethod) => {
    try {
      const category = Object.assign(
        values,
        { fixed_price: Number(values.fixed_price || 0) },
        { per_kilometer: Number(values.per_kilometer || 0) },
        {
          delivery_method_area_rules: values.delivery_method_area_rules?.map(area => {
            return {
              ...area,
              price: Number(area.price || 0)
            }
          })
        }
      )

      if (editMode) {
        await BasicService.editDeliveryMethod(Number(values.id), category)
      } else {
        await BasicService.createDeliveryMethod(category)
      }

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleEditModal = (row: MRT_Row<DeliveryMethod>) => {
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

  const handleDeleteRow = useCallback(async (row: MRT_Row<DeliveryMethod>) => {
    const id: number = row.getValue('id')
    const name = DeliveryTypeMap.get(row.original?.delivery_type) || ''

    if (id) {
      confirm({ groupName: 'روش ارسال', name })
        .then(async () => {
          try {
            await BasicService.deleteDeliveryMethod(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const handleInfoEndpoints = useCallback(async (row: MRT_Row<DeliveryMethod>) => {
    setSelectedDeliveryMethod(row.original)
    setIsOpen(true)
  }, [])

  const columns = useMemo<MRT_ColumnDef<DeliveryMethod>[]>(
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
        accessorKey: 'delivery_type',
        header: 'نوع',
        size: 100,
        Cell: ({ cell }) => <Box>{DeliveryTypeMap.get(cell.getValue<DeliveryType>())}</Box>,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'delivery_charge_type',
        header: 'نوع تسویه',
        size: 100,
        Cell: ({ cell }) => <Box>{DeliveryChargeTypeMap.get(cell.getValue<DeliveryChargeType>())}</Box>,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'delivery_pricing_type',
        header: 'نوع قیمت گذاری',
        size: 100,
        Cell: ({ cell }) => <Box>{DeliveryPricingTypeMap.get(cell.getValue<DeliveryPricingType>())}</Box>,
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'fixed_price',
        header: 'هزینه ثابت',
        exportData: {
          width: 40
        }
      },
      {
        accessorKey: 'per_kilometer',
        header: 'هزینه بر هر کیلومتر',
        exportData: {
          width: 40
        }
      },

      {
        accessorKey: 'is_enabled',
        header: 'وضعیت',
        size: 80,
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue<boolean>() ? (
              <Chip label='فعال' color='success' />
            ) : (
              <Chip label='غیر فعال' color='secondary' />
            )}
          </Box>
        )
      },
      {
        accessorKey: 'description',
        header: 'توضیحات',
        size: 300,
        exportData: {
          width: 10
        }
      }
    ],
    []
  )

  const handleFetchAllData = async () => {
    return BasicService.getAllDeliveryMethod().then(data => data.data)
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
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Tooltip arrow placement='top' title='اصلاح'>
              <IconButton onClick={() => handleEditModal(row)}>
                <Pencil />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='top' title='ناحیه ها'>
              <IconButton color='warning' onClick={() => handleInfoEndpoints(row)}>
                <MapMarkerDistance />
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ButtonStyled
              component='label'
              variant='contained'
              onClick={() => handleAddModal()}
              size={isSmallScreen ? 'small' : 'large'}
            >
              {!isSmallScreen && <span>افزودن روش ارسال جدید</span>}
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
              filePreName='delivery-methods'
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

      {selectedDeliveryMethod ? (
        <DeliveryMethodDialog deliveryMethod={selectedDeliveryMethod} open={isOpen} onClose={() => setIsOpen(false)} />
      ) : (
        <></>
      )}
    </>
  )
}

interface CreateEditModalProps {
  columns: MRT_ColumnDef<DeliveryMethod>[]
  onClose: () => void
  onSubmit: (values: DeliveryMethod) => void
  open: boolean
  editRowData: DeliveryMethod | null
  editMode: boolean
}

export const CreateEditModal = ({ open, columns, onClose, onSubmit, editRowData, editMode }: CreateEditModalProps) => {
  const default_values: Partial<DeliveryMethod> = {
    id: 1,
    delivery_type: DeliveryType.POST_FAST,
    fixed_price: 0,
    per_kilometer: 0,
    delivery_charge_type: DeliveryChargeType.PREPAID,
    is_enabled: false,
    description: ''
  }
  const [values, setValues] = useState<Partial<DeliveryMethod>>({ ...default_values })

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
        JSON.stringify(
          Object.assign({
            ...values,
            fixed_price: Number(values?.fixed_price || 0),
            per_kilometer: Number(values?.per_kilometer || 0)
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

  const handleChangeDeliveryMethodType = async (value: DeliveryType | null) => {
    if (value) setValues({ ...values, delivery_type: value })
  }

  const handleChangeDeliveryChargingType = async (value: DeliveryChargeType | null) => {
    if (value) setValues({ ...values, delivery_charge_type: value })
  }

  const handleChangeDeliveryPricingType = async (value: DeliveryPricingType | null) => {
    if (value) setValues({ ...values, delivery_pricing_type: value })
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
                column.accessorKey === 'delivery_type' ? (
                  <Autocomplete
                    key={column.accessorKey}
                    value={values.delivery_type}
                    getOptionLabel={item => `${DeliveryTypeMap.get(item)}`}
                    options={Object.values(DeliveryType)}
                    isOptionEqualToValue={(option, value) => option === value}
                    noOptionsText={'هیچ آیتمی موجود نیست'}
                    renderOption={(props, item) => (
                      <Box component='li' {...props} key={item}>
                        {DeliveryTypeMap.get(item)}
                      </Box>
                    )}
                    renderInput={params => <TextField {...params} label={column.header} />}
                    onChange={(_, value) => handleChangeDeliveryMethodType(value)}
                  />
                ) : column.accessorKey === 'delivery_charge_type' ? (
                  <Autocomplete
                    key={column.accessorKey}
                    value={values.delivery_charge_type}
                    getOptionLabel={item => `${DeliveryChargeTypeMap.get(item)}`}
                    options={Object.values(DeliveryChargeType)}
                    isOptionEqualToValue={(option, value) => option === value}
                    noOptionsText={'هیچ آیتمی موجود نیست'}
                    renderOption={(props, item) => (
                      <Box component='li' {...props} key={item}>
                        {DeliveryChargeTypeMap.get(item)}
                      </Box>
                    )}
                    renderInput={params => <TextField {...params} label={column.header} />}
                    onChange={(_, value) => handleChangeDeliveryChargingType(value)}
                  />
                ) : column.accessorKey === 'delivery_pricing_type' ? (
                  <Autocomplete
                    key={column.accessorKey}
                    value={values.delivery_pricing_type}
                    getOptionLabel={item => `${DeliveryPricingTypeMap.get(item)}`}
                    options={Object.values(DeliveryPricingType)}
                    isOptionEqualToValue={(option, value) => option === value}
                    noOptionsText={'هیچ آیتمی موجود نیست'}
                    renderOption={(props, item) => (
                      <Box component='li' {...props} key={item}>
                        {DeliveryPricingTypeMap.get(item)}
                      </Box>
                    )}
                    renderInput={params => <TextField {...params} label={column.header} />}
                    onChange={(_, value) => handleChangeDeliveryPricingType(value)}
                  />
                ) : column.accessorKey === 'is_enabled' ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.is_enabled}
                        name={column.accessorKey}
                        onChange={e => setValues({ ...values, [e.target.name]: e.target.checked })}
                      />
                    }
                    label={<Typography variant='subtitle1'>فعال/غیرفعال</Typography>}
                  />
                ) : (
                  <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    value={values[column.accessorKey as keyof DeliveryMethod]}
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

export default TableDeliveryMethod
