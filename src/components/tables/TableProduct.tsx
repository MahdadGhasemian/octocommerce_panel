// ** React Imports
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import {
  Box,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  styled,
  ButtonProps,
  Autocomplete,
  Typography,
  useTheme,
  useMediaQuery,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material'

// ** Icons Imports
import { ContentCopy, Delete, Pencil, Plus } from 'mdi-material-ui'

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
import { TreeView, TreeItem } from '@mui/x-tree-view'

// ** Component Imports
import { NumericFormat, NumericFormatProps } from 'react-number-format'

// ** Services Import
import BasicService, {
  Category,
  CategoryTree,
  ExternalSeller,
  MaterialUnit,
  PackagingCost,
  Product,
  ProductType,
  Specification
} from '@/services/basic.service'
import ExportButton from '../ExportButton'

// ** Import
import { useConfirmation } from '@/context/confirmationContext'
import ProductImage from '../ProductImage'
import { InputColumnFiltersModel } from '@/services/param'
import ProductImageMultiple from '../ProductImageMultiple'
import ProductSpecification from '../ProductSpecification'
import ProductExternalSeller from '../ProductExternalSeller'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'
import KeywordInput from '@/components/KeywordInput'

// ** Map Types Imports
import { MaterialUnitMap } from '@/map-types'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ImgStyled = styled('img')(({ theme }) => ({
  width: 64,
  height: 64,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

export type TableProductProps = {
  categoriesTree?: Array<CategoryTree>
  packagingCostList: Array<PackagingCost>
}

interface NumericFormatCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

const NumericFormatCustom = forwardRef<NumericFormatProps, NumericFormatCustomProps>(function NumericFormatCustom(
  props,
  ref
) {
  const { onChange, ...other } = props

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={values => {
        onChange({
          target: {
            name: props.name,
            value: values.value
          }
        })
      }}
      thousandSeparator
      valueIsNumericString
      prefix=''
    />
  )
})

const incrementString = (input: string): string => {
  // Use a regular expression to match the trailing number (if any)
  const match = input.match(/(.*?)(\d+)$/)

  if (match) {
    // If a number is found at the end, increment it
    const prefix = match[1]
    const number = match[2]
    const incrementedNumber = (parseInt(number, 10) + 1).toString()

    return prefix + incrementedNumber
  } else {
    // If no number is found at the end, append '1'
    return input + '1'
  }
}

const TableProduct = (props: TableProductProps) => {
  // ** Props
  const { categoriesTree, packagingCostList } = props

  // ** Hook
  const theme = useTheme()

  // ** Store
  const { dispatch } = store

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  //data and fetching state
  const [data, setData] = useState<Product[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string
  }>({})
  const [editRowData, setEditRowData] = useState<Product | null>(null)
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
        const response = await BasicService.getAllProductAdmin(
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

  const handleCreateNewOrEditRow = async (values: Product): Promise<boolean> => {
    try {
      const product = Object.assign(values)

      if (editMode) {
        await BasicService.editProduct(Number(values.id), product)
        dispatch(toastSuccess('اطلاعات محصول با موفقیت ذخیره شد.'))
      } else {
        await BasicService.createProduct(product)
        dispatch(toastSuccess('محصول جدید با موفقیت ایجاد شد.'))
      }

      setRefreshKey(key => key + 1)

      return true
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred'
      dispatch(toastError('Error occurred during product creation/edit: ' + errorMessage))

      return false
    }
  }

  const handleEditModal = (row: MRT_Row<Product>) => {
    setEditRowData(row.original)
    setEditMode(true)
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

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Product>) => {
    const id: number = row.getValue('id')
    const name = row.original.name

    if (id) {
      confirm({ groupName: 'کالا', name })
        .then(async () => {
          try {
            await BasicService.deleteProduct(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const handleCreateDuplicateRow = useCallback(async (row: MRT_Row<Product>) => {
    try {
      const product = {
        ...row.original,
        is_active: false,
        is_online_payment_allowed: false,
        name: `${row.original.name} - ${Math.random().toString().slice(-4)}`,
        product_code: incrementString(row.original.product_code),
        sale_price: +row.original.sale_price,
        discount_percentage: 0,
        discount_amount: 0,
        price_scale_value: 1,
        is_scalable_price: false,
        specifications: row.original.specifications.map(spec => {
          return {
            key: spec.key,
            value: '',
            key_2: spec.key_2,
            value_2: ''
          }
        }),
        external_sellers: []
      }

      await BasicService.createProduct(product)
      dispatch(toastSuccess('محصول جدید با موفقیت ایجاد شد.'))

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }, [])

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<Product>): MRT_ColumnDef<Product>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: event => {
          const isValid =
            cell.column.id === 'email'
              ? validateEmail(event.target.value)
              : cell.column.id === 'age'
              ? validateAge(+event.target.value)
              : validateRequired(event.target.value)
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

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
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
        accessorKey: 'product_code',
        header: 'کد کالا',
        size: 140,
        exportData: {
          width: 20
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'name',
        header: 'نام',
        size: 400,
        exportData: {
          width: 40
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'image',
        header: 'عکس',
        size: 80,
        exportData: {
          width: 10
        },
        Cell: ({ cell }) => <ImgStyled src={`${cell.getValue()}`} style={{ objectFit: 'cover' }} alt='تصویر محصول' />,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'images',
        header: 'عکس های بیشتر',
        size: 80,
        exportData: {
          width: 10
        },
        Cell: ({ cell }) => (
          <ImgStyled
            src={`${cell.getValue<string[]>()?.length ? cell.getValue<string[]>()[0] : ''}`}
            style={{ objectFit: 'cover' }}
            alt='تصویر دوم محصول'
          />
        ),
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'category_id',
        header: 'دسته بندی',
        size: 200,
        exportData: {
          width: 20
        },
        Cell: ({ row }) => <Box>{row.original.category?.name}</Box>,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'sale_price',
        header: 'قیمت فروش',
        size: 140,
        exportData: {
          width: 20,
          isCurrency: true,
          accessorFn: (row: Partial<Product>) => Number(row?.sale_price)
        },
        Cell: ({ cell }) => <div>{Number(cell.getValue()).toLocaleString()}</div>,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          InputProps: {
            inputComponent: NumericFormatCustom as any
          }
        })
      },

      {
        accessorKey: 'price_scale_value',
        header: 'ضریب یوانی محصول',
        size: 140,
        exportData: {
          width: 20,
          isCurrency: true,
          accessorFn: (row: Partial<Product>) => Number(row?.price_scale_value)
        },
        Cell: ({ cell }) => <div>{Number(cell.getValue()).toLocaleString()}</div>,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          InputProps: {
            inputComponent: NumericFormatCustom as any
          }
        })
      },
      {
        accessorKey: 'is_scalable_price',
        header: 'ضریب قیمت',
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue<boolean>() ? (
              <Chip label='فعال' color='success' />
            ) : (
              <Chip label='غیر فعال' color='secondary' />
            )}
          </Box>
        ),
        size: 80,
        exportData: {
          width: 10,
          accessorFn: (row: Partial<Product>) => `${row?.is_scalable_price ? 'فعال' : 'غیر فعال'}`
        }
      },
      {
        accessorKey: 'discount_percentage',
        header: 'درصد تخفیف',
        size: 140,
        exportData: {
          width: 20,
          isCurrency: true,
          accessorFn: (row: Partial<Product>) => Number(row?.discount_percentage)
        },
        Cell: ({ cell }) => <div>{Number(cell.getValue()).toLocaleString()}</div>,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          InputProps: {
            inputComponent: NumericFormatCustom as any
          }
        })
      },
      {
        accessorKey: 'discount_amount',
        header: 'مبلغ تخفیف',
        size: 140,
        exportData: {
          width: 20,
          isCurrency: true,
          accessorFn: (row: Partial<Product>) => Number(row?.discount_amount)
        },
        Cell: ({ cell }) => <div>{Number(cell.getValue()).toLocaleString()}</div>,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          InputProps: {
            inputComponent: NumericFormatCustom as any
          }
        })
      },
      {
        accessorKey: 'is_active',
        header: 'وضعیت',
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue<boolean>() ? (
              <Chip label='فعال' color='success' />
            ) : (
              <Chip label='غیر فعال' color='secondary' />
            )}
          </Box>
        ),
        size: 80,
        exportData: {
          width: 10,
          accessorFn: (row: Partial<Product>) => `${row?.is_active ? 'فعال' : 'غیر فعال'}`
        }
      },
      {
        accessorKey: 'is_online_payment_allowed',
        header: 'امکان پرداخت اینترنتی',
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue<boolean>() ? (
              <Chip label='فعال' color='success' />
            ) : (
              <Chip label='غیر فعال' color='secondary' />
            )}
          </Box>
        ),
        size: 80,
        exportData: {
          width: 10,
          accessorFn: (row: Partial<Product>) => `${row?.is_online_payment_allowed ? 'فعال' : 'غیر فعال'}`
        }
      },
      {
        accessorKey: 'unit',
        header: 'واحد',
        size: 80,
        exportData: {
          width: 10,
          accessorFn: (row: Partial<Product>) => (row?.unit ? MaterialUnitMap.get(row.unit) : '')
        },
        muiTableBodyCellEditTextFieldProps: {
          select: true,
          children: Array.from(MaterialUnitMap).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))
        },
        Cell: ({ cell }) => <Box>{MaterialUnitMap.get(cell.getValue<MaterialUnit>())}</Box>
      },
      {
        accessorKey: 'description',
        header: 'توضیح',
        Cell: ({ cell }) => (
          <p>
            {cell.getValue<string>()?.length < 100
              ? cell.getValue<string>()
              : `${cell.getValue<string>().slice(0, 50)} ...`}
          </p>
        ),
        size: 500,
        exportData: {
          width: 70
        }
      }
    ],
    [getCommonEditTextFieldProps]
  )

  const handleFetchAllData = async () => {
    return BasicService.getAllProductAdmin().then(data => data.data)
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
          <Box sx={{ display: 'flex', gap: '1' }}>
            <Tooltip arrow placement='top' title='اصلاح'>
              <IconButton onClick={() => handleEditModal(row)}>
                <Pencil />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement='top' title='کپی'>
              <IconButton color='info' onClick={() => handleCreateDuplicateRow(row)}>
                <ContentCopy />
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
              {!isSmallScreen && <span>افزودن کالای جدید</span>}
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
            <ExportButton selectedData={data} columns={columns} filePreName='products' fetchData={handleFetchAllData} />
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
        categoriesTree={categoriesTree}
        packagingCostList={packagingCostList}
      />
    </>
  )
}

interface CreateEditModalProps {
  columns: MRT_ColumnDef<Product>[]
  onClose: () => void
  onSubmit: (values: Product) => Promise<boolean>
  open: boolean
  editRowData: Product | null
  editMode: boolean
  categoriesTree?: Array<CategoryTree>
  packagingCostList: Array<PackagingCost>
}

export const CreateEditModal = ({
  open,
  onClose,
  onSubmit,
  editRowData,
  editMode,
  categoriesTree,
  packagingCostList
}: CreateEditModalProps) => {
  const default_values: Product = {
    id: 0,
    product_code: '',
    name: '',
    description: '',
    category_id: 1,
    category: {} as Category,
    image: '',
    images: [],
    datasheet: '',
    part_number: '',
    product_type: ProductType.Unknown,
    keywords: [],
    available_quantity: 0,
    sale_price: 0,
    discount_percentage: 0,
    discount_amount: 0,
    price_scale_value: 1,
    is_scalable_price: false,
    packaging_cost_id: 1,
    packaging_cost: {} as PackagingCost,
    unit: MaterialUnit.Device as MaterialUnit,
    is_active: false,
    is_online_payment_allowed: false,
    specifications: [],
    external_sellers: [],
    created_at: new Date(),
    updated_at: new Date()
  }
  const [values, setValues] = useState<Product>({ ...default_values })
  const [productImage, setProductImage] = useState<string | undefined>(editRowData?.image)
  const [productImages, setProductImages] = useState<string[] | undefined>(editRowData?.images)
  const [specifications, setSpecifications] = useState<Specification[] | undefined>(editRowData?.specifications)
  const [external_sellers, setExternalSellers] = useState<ExternalSeller[] | undefined>(editRowData?.external_sellers)
  const [expanded, setExpanded] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('')
  const [packagingCost, setPackagingCost] = useState<PackagingCost | null>(
    editRowData?.packaging_cost ? editRowData.packaging_cost : null
  )

  const clearData = () => {
    setValues({ ...default_values })
    setProductImage(undefined)
    setProductImages(undefined)
    setSpecifications(undefined)
    setExternalSellers(undefined)
    setPackagingCost(null)
  }

  useEffect(() => {
    if (editRowData) {
      setValues({ ...editRowData })
      setProductImage(editRowData.image)
      setProductImages(editRowData.images)
      setSpecifications(editRowData.specifications)
      setExternalSellers(editRowData.external_sellers)

      const packagingCost = packagingCostList?.find(item => +item.id === +editRowData?.packaging_cost_id)
      if (packagingCost) setPackagingCost(packagingCost)
    }

    // Expand the tree to show the selected category
    if (editMode) {
      setExpanded(getExpandedNodes(editRowData?.category_id, categoriesTree))
      setSelected(String(editRowData?.category_id))
    }
  }, [editRowData])

  useEffect(() => {
    // Expand the tree to show the selected category
    if (editMode) {
      setExpanded(getExpandedNodes(editRowData?.category_id, categoriesTree))
      setSelected(String(editRowData?.category_id))
    }
  }, [editMode, categoriesTree])

  const handleSubmit = async () => {
    const success = await onSubmit(
      JSON.parse(
        JSON.stringify(
          Object.assign(
            { ...values },
            values.sale_price && { sale_price: parseInt(String(values.sale_price).replace(/,/g, '')) },
            values.discount_percentage && {
              discount_percentage: Number(values.discount_percentage)
            },
            values.discount_amount && {
              discount_amount: Number(values.discount_amount)
            },
            values.price_scale_value && {
              price_scale_value: Number(values.price_scale_value)
            },
            values.is_scalable_price && { is_scalable_price: !!values.is_scalable_price },
            values.is_active && { is_active: !!values.is_active },
            values.is_online_payment_allowed && { is_online_payment_allowed: !!values.is_online_payment_allowed },
            Number(values.category_id) > 0 && { category_id: Number(values.category_id) },
            packagingCost && { packaging_cost_id: packagingCost.id },
            packagingCost && { packaging_cost: packagingCost },
            { images: productImages?.filter(image => image.length > 1) },
            { specifications },
            { external_sellers }
          )
        )
      )
    )

    if (success) {
      clearData()
      onClose()
    }
  }

  const handleClose = () => {
    clearData()
    onClose()
  }

  const handleChangeUnit = async (value: MaterialUnit | null) => {
    if (value) setValues({ ...values, unit: value })
  }

  const handleTreeSelect = async (event: React.SyntheticEvent, nodeId: string) => {
    setExpanded(getExpandedNodes(nodeId, categoriesTree))
    setSelected(String(nodeId))
    setValues({ ...values, category_id: Number(nodeId) })
  }

  const handleSalePriceChange = async (value: number) => {
    const discount_amount =
      values.discount_percentage > 0 ? +((value * values.discount_percentage) / 100).toFixed(0) : 0
    if (value) setValues({ ...values, sale_price: value, discount_amount })
  }

  const handleDiscountPercentageChange = async (value: number) => {
    const discount_amount = value > 0 ? +((values.sale_price * value) / 100).toFixed(0) : 0
    if (value) setValues({ ...values, discount_percentage: value, discount_amount })
  }

  const handleDiscountAmountChange = async (value: number) => {
    const discount_percentage = value > 0 ? +((value / values.sale_price) * 100).toFixed(2) : 0
    if (value) setValues({ ...values, discount_amount: value, discount_percentage })
  }

  const handleAvailableQuantityChange = async (value: number) => {
    if (value) setValues({ ...values, available_quantity: value })
  }

  const getExpandedNodes = (categoryId?: number | string, tree?: Array<CategoryTree>) => {
    // This function recursively finds and returns all parent node IDs up to the root
    const nodes: string[] = []

    const findNode = (id?: number | string, nodesArray?: Array<CategoryTree>) => {
      if (nodesArray)
        for (const node of nodesArray) {
          if (String(node.id) === String(id)) {
            return true
          } else if (node.children) {
            if (findNode(id, node.children)) {
              nodes.push(String(node.id))

              return true
            }
          }
        }

      return false
    }
    findNode(categoryId, tree)

    nodes.push(String(categoryId))

    return nodes
  }

  const renderTree = (nodes_: CategoryTree | undefined, firstItem = false) => {
    const elem = (nodes: CategoryTree) => (
      <TreeItem
        key={nodes.id}
        nodeId={String(nodes.id)}
        label={!firstItem ? <Box sx={{ margin: 1, paddingY: 0.5 }}>{nodes.name}</Box> : <></>}
      >
        {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
      </TreeItem>
    )

    return nodes_ ? elem(nodes_) : <></>
  }

  const keyworsChange = (keywords: string[]) => {
    setValues({ ...values, keywords })
  }

  return (
    <Dialog open={open} fullWidth maxWidth={'lg'}>
      <DialogTitle textAlign='center'>اطلاعات کالا</DialogTitle>
      <DialogContent>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={4} marginY={4}>
            {/* Product Code */}
            <Grid item xs={12} md={3}>
              <TextField label='کد کالا' name='product_code' value={values.product_code} disabled fullWidth />
            </Grid>
            {/* Name */}
            <Grid item xs={12} md={9}>
              <TextField
                label='نام'
                name='name'
                value={values.name}
                onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                fullWidth
              />
            </Grid>
            {/* SalePrice */}
            <Grid item xs={12} md={3}>
              <TextField
                label='قیمت فروش'
                name='sale_price'
                value={values.sale_price}
                onChange={e => handleSalePriceChange(+e.target.value)}
                InputProps={{
                  inputComponent: NumericFormatCustom as any
                }}
                fullWidth
              />
            </Grid>
            {/* Price Scale Value */}
            <Grid item xs={12} md={3}>
              <TextField
                type='number'
                label='ضریب یوانی (قیمت به یوان)'
                name='price_scale_value'
                value={values.price_scale_value}
                onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                fullWidth
              />
            </Grid>
            {/* Is Scalable Price */}
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.is_scalable_price}
                    name='is_scalable_price'
                    onChange={e => setValues({ ...values, [e.target.name]: e.target.checked })}
                  />
                }
                label={<Typography variant='subtitle1'>ضریب قیمت</Typography>}
              />
            </Grid>
            {/* Unit */}
            <Grid item xs={12} md={2}>
              <Autocomplete
                value={values.unit}
                getOptionLabel={item => `${MaterialUnitMap.get(item)}`}
                options={Object.values(MaterialUnit)}
                isOptionEqualToValue={(option, value) => option === value}
                noOptionsText={'هیچ آیتمی موجود نیست'}
                renderOption={(props, item) => (
                  <Box component='li' {...props} key={item}>
                    {MaterialUnitMap.get(item)}
                  </Box>
                )}
                renderInput={params => <TextField {...params} label='واحد' />}
                onChange={(_, value) => handleChangeUnit(value)}
              />
            </Grid>
            {/* Status */}
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.is_active}
                    name='is_active'
                    onChange={e => setValues({ ...values, [e.target.name]: e.target.checked })}
                  />
                }
                label={<Typography variant='subtitle1'>فعال</Typography>}
              />
            </Grid>
            {/* Discount Percentage */}
            <Grid item xs={12} md={3}>
              <TextField
                type='number'
                label='درصد تخفیف'
                name='discount_percentage'
                value={values.discount_percentage}
                onChange={e => handleDiscountPercentageChange(+e.target.value)}
                fullWidth
              />
            </Grid>
            {/* Discount Amount */}
            <Grid item xs={12} md={3}>
              <TextField
                type='number'
                label='مبلغ تخفیف'
                name='discount_amount'
                value={values.discount_amount}
                onChange={e => handleDiscountAmountChange(+e.target.value)}
                fullWidth
              />
            </Grid>
            {/* Available Quantity */}
            <Grid item xs={12} md={4}>
              <TextField
                label='موجودی'
                name='available_quantity'
                value={values.available_quantity}
                onChange={e => handleAvailableQuantityChange(+e.target.value)}
                InputProps={{
                  inputComponent: NumericFormatCustom as any
                }}
                fullWidth
              />
            </Grid>
            {/* Is Online Payment Allowed */}
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.is_online_payment_allowed}
                    name='is_online_payment_allowed'
                    onChange={e => setValues({ ...values, [e.target.name]: e.target.checked })}
                  />
                }
                label={<Typography variant='subtitle1'>پرداخت اینترنتی</Typography>}
              />
            </Grid>
            {/*  */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                value={packagingCost}
                options={packagingCostList}
                getOptionLabel={item => `${item.title}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={'هیچ آیتمی موجود نیست'}
                renderOption={(props, product) => (
                  <Box
                    component='li'
                    {...props}
                    key={product.title}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme => theme.palette.divider
                      }
                    }}
                    gap={1}
                  >
                    <Typography>{product.title}</Typography>
                  </Box>
                )}
                renderInput={params => <TextField {...params} label='عنوان بسته بندی' />}
                onChange={(_, value) => setPackagingCost(value)}
              />
            </Grid>
            {/* Keywords */}
            <Grid item xs={12}>
              <KeywordInput
                label={'کلید واژه ها'}
                placeholder={'بعد از هر کلید واژه یک بار اینتر را بزنید'}
                initialKeywords={values.keywords}
                onChange={keywords => keyworsChange(keywords)}
              />
            </Grid>
            {/* Packaging Cost Items */}
            <Grid item xs={12}></Grid>
            {/* Specification */}
            <Grid item xs={12}>
              <Box sx={{ border: 1, borderColor: 'action.disabled', borderRadius: 1, padding: 4 }}>
                <ProductSpecification
                  initialSpecifications={specifications}
                  onChange={newSpecifications => setSpecifications(newSpecifications)}
                />
              </Box>
            </Grid>
            {/* Image and Images */}
            <Grid item xs={12} md={4} style={{ height: '100%' }}>
              <Box display='flex' flexDirection='column' gap={4}>
                {/* Image */}
                <ProductImage
                  componentId='product-main-image'
                  initialImage={productImage}
                  onChange={newImageUrl => setValues({ ...values, image: newImageUrl })}
                />
                {/* Images */}
                <ProductImageMultiple
                  initialImages={productImages}
                  onChange={newImageUrls => setProductImages(newImageUrls)}
                />
              </Box>
            </Grid>
            {/* Categories and Description */}
            <Grid item xs={12} md={8}>
              <Box display='flex' flexDirection='column' gap={4}>
                {/* Categories */}
                <Box
                  sx={{
                    border: 1,
                    borderRadius: 1,
                    borderColor: 'action.disabled',
                    paddingTop: 1
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{
                      ml: 3,
                      lineHeight: 1,
                      fontWeight: 400,
                      fontSize: '1.2rem !important'
                    }}
                  >
                    دسته بندی :
                  </Typography>
                  {editMode ? (
                    <TreeView
                      aria-label='دسته بندی'
                      defaultExpanded={['1']}
                      expanded={expanded}
                      selected={selected}
                      onNodeSelect={handleTreeSelect}
                      sx={{ height: 320, flexGrow: 1, overflowY: 'auto' }}
                    >
                      {Array.isArray(categoriesTree) ? renderTree(categoriesTree[0], true) : <></>}
                    </TreeView>
                  ) : (
                    <TreeView
                      aria-label='دسته بندی'
                      defaultExpanded={['1']}
                      onNodeSelect={handleTreeSelect}
                      sx={{ height: 320, flexGrow: 1, overflowY: 'auto' }}
                    >
                      {categoriesTree?.length ? renderTree(categoriesTree[0]) : <></>}
                    </TreeView>
                  )}
                </Box>
                {/* Description */}
                <TextField
                  label='توضیح'
                  name='description'
                  value={values.description}
                  onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                  multiline
                  minRows={10}
                  fullWidth
                />
              </Box>
            </Grid>
            {/* ExternalSeller */}
            <Grid item xs={12}>
              <Box sx={{ border: 1, borderColor: 'action.disabled', borderRadius: 1, padding: 4 }}>
                <ProductExternalSeller
                  initialExternalSellers={external_sellers}
                  onChange={newExternalSellers => setExternalSellers(newExternalSellers)}
                />
              </Box>
            </Grid>
          </Grid>
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
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
const validateAge = (age: number) => age >= 18 && age <= 50

export default TableProduct
