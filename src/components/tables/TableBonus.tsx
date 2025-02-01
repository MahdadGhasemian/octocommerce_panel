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
  DialogActions,
  styled,
  ButtonProps,
  useTheme,
  useMediaQuery,
  Stack,
  TextField,
  Autocomplete,
  Avatar,
  Chip,
  FormControlLabel,
  Checkbox,
  Typography
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
import BasicService, { Bonus, BonusType, Product } from '@/services/basic.service'
import AuthService, { User } from '@/services/auth.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { isInternalUser } from '@/redux/slices/authSlice'

// ** Import libraries
import moment from 'moment-jalaali'

// ** Date Picker Import
import { DatePicker } from '@mui/x-date-pickers'
import { InputColumnFiltersModel } from '@/services/param'

// ** Map Types Imports
import { BonusTypeMap } from '@/map-types'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableBonus = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? {} : { right: ['mrt-row-actions'] }

  // ** Confirm
  const { confirm } = useConfirmation()

  // ** Global State
  const isAccess = useSelector(isInternalUser)

  // ** States
  const [data, setData] = useState<Bonus[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editRowData, setEditRowData] = useState<Bonus | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string
  }>({})
  const [editMode, setEditMode] = useState<boolean>(false)

  // ** Table states
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
        const response = await BasicService.getAllBonus(
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

  useEffect(() => {
    if (isAccess) {
      loadUsers()
      loadProducts()
    }
  }, [])

  const loadUsers = () => {
    AuthService.getAllUser()
      .then(response => {
        // setUsers(response.data.filter(user => user.role === Role.User))
        setUsers(response.data)
      })
      .catch(e => {
        e
      })
  }

  const loadProducts = () => {
    BasicService.getAllProduct(1000)
      .then(response => {
        setProducts(response.data)
      })
      .catch(e => {
        e
      })
  }

  const handleCreateNewOrEditRow = async (values: Bonus) => {
    try {
      const bonus = Object.assign(
        values,
        Number(values.constant_amount) >= 0 && { constant_amount: Number(values.constant_amount) },
        Number(values.percentage_amount) >= 0 && { percentage_amount: Number(values.percentage_amount) },
        { allowed_user_ids: values.allowed_users?.map(userInfo => userInfo.id) },
        { allowed_product_ids: values.allowed_products?.map(product => product.id) }
      )

      if (editMode) {
        await BasicService.editBonus(values.id, bonus)
      } else {
        await BasicService.createBonus(bonus)
      }

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleEditModal = (row: MRT_Row<Bonus>) => {
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
  }

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Bonus>) => {
    const id: number = row.getValue('id')
    const name = row.original.title

    if (id) {
      confirm({ groupName: 'پاداش', name })
        .then(async () => {
          try {
            await BasicService.deleteBonus(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<Bonus>): MRT_ColumnDef<Bonus>['muiTableBodyCellEditTextFieldProps'] => {
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

  const columns = useMemo<MRT_ColumnDef<Bonus>[]>(
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
        accessorKey: 'is_enabled',
        header: 'وضعیت',
        size: 80,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        }),
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
        accessorKey: 'bonus_type',
        header: 'نوع',
        size: 80,
        exportData: {
          width: 10,
          accessorFn: (row: Partial<Bonus>) => (row?.bonus_type ? BonusTypeMap.get(row.bonus_type) : '')
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        }),
        Cell: ({ cell }) => <Box>{BonusTypeMap.get(cell.getValue<BonusType>())}</Box>
      },
      {
        accessorKey: 'constant_amount',
        header: 'مبلغ',
        size: 80,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'percentage_amount',
        header: 'درصد',
        size: 80,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'start_date',
        accessorFn: row => (row?.start_date ? moment(row.start_date).format('jYYYY/jMM/jDD') : ''),
        id: 'start_date',
        header: 'تاریخ شروع',
        exportData: {
          width: 20,
          accessorFn: (row: Partial<Bonus>) => (row?.start_date ? moment(row.start_date).format('jYYYY/jMM/jDD') : '')
        }
      },
      {
        accessorKey: 'end_date',
        accessorFn: row => (row?.end_date ? moment(row.end_date).format('jYYYY/jMM/jDD') : ''),
        id: 'end_date',
        header: 'تاریخ پایان',
        exportData: {
          width: 20,
          accessorFn: (row: Partial<Bonus>) => (row?.end_date ? moment(row.end_date).format('jYYYY/jMM/jDD') : '')
        }
      },
      {
        accessorKey: 'allowed_users',
        header: 'کاربران',
        id: 'users',
        size: 300,
        Cell: ({ row }) => (
          <Stack direction='row' justifyContent='start' alignItems='start' spacing={2}>
            {row.original?.allowed_users
              ?.sort((a, b) => +a.id - +b.id)
              .map(userInfo => (
                <Chip
                  key={userInfo.id}
                  avatar={
                    <Avatar
                      alt={userInfo?.last_name}
                      src={`${userInfo.avatar}?width=120`}
                      imgProps={{ crossOrigin: 'use-credentials' }}
                      sx={{ width: '2.5rem', height: '2.5rem' }}
                    />
                  }
                  label={`${userInfo?.first_name || ''} ${userInfo?.last_name || ''}`}
                  variant='outlined'
                />
              ))}
          </Stack>
        )
      },
      {
        accessorKey: 'allowed_products',
        header: 'کالا',
        id: 'products',
        size: 300,
        Cell: ({ row }) => (
          <Stack direction='row' justifyContent='start' alignItems='start' spacing={2}>
            {row.original?.allowed_products
              ?.sort((a, b) => a.id - b.id)
              ?.slice(0, 2)
              .map(product => (
                <Chip
                  key={product.id}
                  label={`${product?.name || ''} ${product?.product_code || ''}`}
                  variant='outlined'
                />
              ))}
          </Stack>
        )
      },
      {
        accessorKey: 'description',
        header: 'توضیح',
        size: 300,
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
            ایجاد پاداش جدید
          </ButtonStyled>
        )}
      />
      <CreateNewBonusModal
        columns={columns}
        open={createModalOpen}
        onClose={() => handleModalClosed()}
        onSubmit={handleCreateNewOrEditRow}
        userList={users}
        productList={products}
        editRowData={editRowData}
        editMode={editMode}
      />
    </>
  )
}

interface CreateModalProps {
  columns: MRT_ColumnDef<Bonus>[]
  onClose: () => void
  onSubmit: (values: Bonus) => void
  open: boolean
  userList: User[]
  productList: Product[]
  editRowData: Bonus | null
  editMode: boolean
}

export const CreateNewBonusModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  userList,
  productList,
  editRowData,
  editMode
}: CreateModalProps) => {
  const default_values = {
    title: '',
    description: '',
    bonus_type: BonusType.Percentage,
    constant_amount: 0,
    percentage_amount: 0,
    is_enabled: true,
    start_date: new Date(),
    end_date: new Date(),
    allowed_user_ids: [],
    allowed_product_ids: []
  }
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [values, setValues] = useState<any>({ ...default_values })

  const clearData = () => {
    setValues({ ...default_values })
    setUsers([])
    setProducts([])
  }

  useEffect(() => {
    if (editMode && editRowData) {
      setValues({ ...editRowData })
      setUsers(editRowData.allowed_users as any)
      setProducts(editRowData.allowed_products as any)
    } else if (!editMode) {
      clearData()
    }
  }, [editRowData, editMode])

  const handleSubmit = () => {
    onSubmit(JSON.parse(JSON.stringify({ ...values, allowed_users: users, allowed_products: products })))
    clearData()
    onClose()
  }

  const handleClose = () => {
    clearData()
    onClose()
  }

  const handleUserChange = (users: User[]) => {
    setUsers(users)
  }

  const handleProductChange = (products: Product[]) => {
    setProducts(products)
  }

  const handleChangeBonusType = async (value: BonusType | null) => {
    if (value) setValues({ ...values, bonus_type: value })
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>قوانین پاداش</DialogTitle>
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
              .map(column =>
                column.accessorKey === 'bonus_type' ? (
                  <Autocomplete
                    key={column.accessorKey}
                    value={values[column.accessorKey]}
                    getOptionLabel={item => `${BonusTypeMap.get(item)}`}
                    options={Object.values(BonusType)}
                    isOptionEqualToValue={(option, value) => option === value}
                    noOptionsText={'هیچ آیتمی موجود نیست'}
                    renderOption={(props, item) => (
                      <Box component='li' {...props} key={item}>
                        {BonusTypeMap.get(item)}
                      </Box>
                    )}
                    renderInput={params => <TextField {...params} label={column.header} />}
                    onChange={(_, value) => handleChangeBonusType(value)}
                  />
                ) : column.accessorKey === 'allowed_users' ? (
                  userList.length ? (
                    <Autocomplete
                      key={column.accessorKey}
                      multiple
                      value={users}
                      options={userList}
                      getOptionLabel={user => `${user?.first_name || ''} ${user?.last_name || ''}`}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText={'هیچ آیتمی موجود نیست'}
                      renderOption={(props, user) => (
                        <Box
                          component='li'
                          {...props}
                          key={user.id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme => theme.palette.divider
                            }
                          }}
                        >
                          {user?.first_name || ''} {user?.last_name || ''}
                        </Box>
                      )}
                      renderInput={params => <TextField {...params} label='کاربر' />}
                      onChange={(_, value) => handleUserChange(value)}
                    />
                  ) : (
                    <></>
                  )
                ) : column.accessorKey === 'allowed_products' ? (
                  productList.length ? (
                    <Autocomplete
                      key={column.accessorKey}
                      multiple
                      value={products}
                      options={productList}
                      getOptionLabel={product => `${product?.name || ''}`}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText={'هیچ آیتمی موجود نیست'}
                      renderOption={(props, product) => (
                        <Box
                          component='li'
                          {...props}
                          key={product.id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme => theme.palette.divider
                            }
                          }}
                        >
                          {product?.name || ''}
                        </Box>
                      )}
                      renderInput={params => <TextField {...params} label='کالا' />}
                      onChange={(_, value) => handleProductChange(value)}
                    />
                  ) : (
                    <></>
                  )
                ) : column.accessorKey === 'start_date' ? (
                  <DatePicker
                    sx={{ width: '100%' }}
                    label='تاریخ شروع'
                    value={values[column?.accessorKey] ? new Date(values[column?.accessorKey]) : null}
                    onChange={value => setValues({ ...values, start_date: value?.toISOString() || '' })}
                  />
                ) : column.accessorKey === 'end_date' ? (
                  <DatePicker
                    sx={{ width: '100%' }}
                    label='تاریخ پایان'
                    value={values[column?.accessorKey] ? new Date(values[column?.accessorKey]) : null}
                    onChange={value => setValues({ ...values, end_date: value?.toISOString() || '' })}
                  />
                ) : column.accessorKey === 'is_enabled' ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values[column.accessorKey as any]}
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
          ذخیره
        </ButtonStyled>
      </DialogActions>
    </Dialog>
  )
}

const validateRequired = (value: string) => !!value.length

export default TableBonus
