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
  Avatar,
  Chip,
  Autocomplete,
  Badge,
  Checkbox
} from '@mui/material'

// ** Icons Imports
import { Eye } from 'mdi-material-ui'

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
import AuthService, { Access, User } from '@/services/auth.service'
import ExportButton from '../ExportButton'
import { InputColumnFiltersModel } from '@/services/param'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'
import { store } from '@/redux/store'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableAccount = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // ** States
  const [data, setData] = useState<User[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string
  }>({})
  const [accessesList, setAccessesList] = useState<Access[]>([])
  const [editRowData, setEditRowData] = useState<User | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<boolean>(false)

  const { dispatch } = store

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
    loadAccesses()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true)
      } else {
        setIsRefetching(true)
      }

      try {
        const response = await AuthService.getAllUser(
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

  const loadAccesses = () => {
    AuthService.getAllAccess()
      .then(response => {
        setAccessesList(response.data)
      })
      .catch(e => {
        e
      })
  }

  const handleCreateNewOrEditRow = async (values: User) => {
    try {
      if (editMode) {
        await Promise.allSettled([
          AuthService.saveUserInfo(+values.id, values),

          AuthService.saveUserAccess(+values.id, {
            access_ids: values['accesses']?.map(access => +access.id) || []
          })
        ])
          .then(() => {
            dispatch(toastSuccess('اطلاعات کاربر با موفقیت بروز رسانی گردید.'))
          })
          .finally(() => {
            setRefreshKey(key => key + 1)
          })
      } else {
        await AuthService.createCustomerUser({
          ...values,
          mobile_phone: values.mobile_phone?.startsWith('0')
            ? values.mobile_phone.replace('0', '+98')
            : values.mobile_phone,
          email: values.email === '' ? undefined : values.email
        })

        dispatch(toastSuccess('کاربر با موفقیت به سیستم اضافه گردید.'))
        setRefreshKey(key => key + 1)
      }
    } catch (error) {
      dispatch(toastError('خطایی رخ داد'))
    }
  }

  const handleAddModal = () => {
    setEditMode(false)
    setCreateModalOpen(true)
  }

  const handleEditModal = (row: MRT_Row<User>) => {
    setEditMode(true)
    setEditRowData(row.original)
    setCreateModalOpen(true)
  }

  const handleModalClosed = () => {
    setCreateModalOpen(false)
  }

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<User>): MRT_ColumnDef<User>['muiTableBodyCellEditTextFieldProps'] => {
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

  const columns = useMemo<MRT_ColumnDef<User>[]>(
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
        accessorKey: 'first_name',
        header: 'نام',
        size: 200,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <Avatar
              alt={row.original?.last_name}
              src={`${row.original.avatar}?width=120`}
              imgProps={{ crossOrigin: 'use-credentials' }}
              sx={{ width: '2.5rem', height: '2.5rem' }}
            />
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{renderedCellValue}</span>
          </Box>
        ),
        exportData: {
          width: 20
        }
      },
      {
        accessorKey: 'last_name',
        header: 'نام خانوادگی',
        size: 200,
        exportData: {
          width: 20
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'mobile_phone',
        header: 'شماره همراه',
        enableEditing: false,
        size: 140,
        Cell: ({ cell, row }) => (
          <Badge
            invisible={!row.original.mobile_phone_is_verified}
            variant='dot'
            color='success'
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {cell.getValue<string>()?.replace('+98', '0')}
          </Badge>
        ),
        exportData: {
          width: 15
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'email',
        header: 'ایمیل',
        enableEditing: false,
        Cell: ({ cell, row }) => (
          <Badge
            invisible={!row.original.email_is_verified}
            variant='dot'
            color='success'
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {cell.getValue<string>()?.replace('+98', '0')}
          </Badge>
        ),
        exportData: {
          width: 20
        },
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      },
      {
        accessorKey: 'accesses',
        id: 'accesses.title',
        header: 'سطح دسترسی',
        Cell: ({ row }) => (
          <Stack direction='row' justifyContent='start' alignItems='start' spacing={2}>
            {row.original?.accesses
              ?.sort((a, b) => +a.id - +b.id)
              ?.slice(0, 3)
              .map(access => (
                <Chip
                  key={access.id}
                  label={`${access?.title || ''}`}
                  variant='outlined'
                  style={{ backgroundColor: `${access.color}` }}
                />
              ))}
            {row.original?.accesses && row.original?.accesses?.length > 2 && (
              <Chip key='more' label='...' variant='outlined' />
            )}
          </Stack>
        ),
        exportData: {
          width: 15
        }
      },
      {
        accessorKey: 'created_by_system',
        header: 'ایجاد شده توسط سیستم',
        enableEditing: false,
        enableColumnOrdering: true,
        Cell: ({ cell }) => <Checkbox checked={Boolean(cell.getValue())} />,
        exportData: {
          width: 10
        }
      }
    ],
    [getCommonEditTextFieldProps]
  )

  const handleFetchAllData = async () => {
    return AuthService.getAllUser().then(data => data.data)
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
          showColumnFilters: false,
          columnVisibility: { id: false }
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
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement='left' title='مشاهده و اصلاح'>
              <IconButton color='info' onClick={() => handleEditModal(row)}>
                <Eye />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderToolbarInternalActions={({ table }) => (
          <>
            <MRT_ToggleGlobalFilterButton table={table} />
            <MRT_ToggleFiltersButton table={table} />
            {!isSmallScreen && <MRT_ShowHideColumnsButton table={table} />}
            {!isSmallScreen && <MRT_ToggleDensePaddingButton table={table} />}
            <MRT_FullScreenToggleButton table={table} />
            <ExportButton selectedData={data} columns={columns} filePreName='accounts' fetchData={handleFetchAllData} />
          </>
        )}
        renderTopToolbarCustomActions={() => (
          <ButtonStyled
            component='label'
            variant='contained'
            onClick={() => handleAddModal()}
            size={isSmallScreen ? 'small' : 'large'}
          >
            افزودن کاربر مشتری
          </ButtonStyled>
        )}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => handleModalClosed()}
        onSubmit={handleCreateNewOrEditRow}
        accessList={accessesList}
        editRowData={editRowData}
        editMode={editMode}
      />
    </>
  )
}

interface CreateModalProps {
  columns: MRT_ColumnDef<User>[]
  onClose: () => void
  onSubmit: (values: User) => void
  open: boolean
  accessList: Access[]
  editRowData: User | null
  editMode: boolean
}

export const CreateNewAccountModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  accessList,
  editRowData,
  editMode
}: CreateModalProps) => {
  const default_values = {
    mobile_phone: '',
    email: '',
    first_name: '',
    last_name: '',
    gender: 'unknown',
    avatar: '',
    accesses: []
  }

  const [accesses, setAccesses] = useState<Access[]>([])
  const [values, setValues] = useState<any>({ ...default_values })

  useEffect(() => {
    if (editRowData) {
      setValues({ ...editRowData })
      setAccesses(editRowData.accesses as any)
    }
  }, [editRowData])

  const clearData = () => {
    setValues({ ...default_values })
    setAccesses([])
  }

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(JSON.parse(JSON.stringify({ ...values, accesses })))
    clearData()
    onClose()
  }

  const handleAccessChange = (accesses: Access[]) => {
    setAccesses(accesses)
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>اطلاعات کاربر</DialogTitle>
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
              .filter(column => column.id !== 'id' && column.id !== 'created_by_system')
              .map(column =>
                column.accessorKey === 'accesses' ? (
                  editMode && accessList.length ? (
                    <Autocomplete
                      key={column.accessorKey}
                      multiple
                      value={accesses}
                      options={accessList}
                      getOptionLabel={access => `${access?.title}`}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText={'هیچ آیتمی موجود نیست'}
                      renderOption={(props, access) => (
                        <Box
                          component='li'
                          {...props}
                          key={access.id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme => theme.palette.divider
                            }
                          }}
                        >
                          {access?.title}
                        </Box>
                      )}
                      renderInput={params => <TextField {...params} label='کاربر' />}
                      onChange={(_, value) => handleAccessChange(value)}
                    />
                  ) : (
                    <></>
                  )
                ) : column.accessorKey === 'mobile_phone' ? (
                  <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    value={values[column.accessorKey as any]?.replace('+98', '0')}
                    onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                    style={{ direction: 'rtl', textAlign: 'left' }}
                    disabled={editMode}
                  />
                ) : (
                  <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    value={values[column.accessorKey as any]}
                    onChange={e => setValues({ ...values, [e.target.name]: e.target.value })}
                    disabled={column.accessorKey === 'email' && editMode}
                  />
                )
              )}
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
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
const validateAge = (age: number) => age >= 18 && age <= 50

export default TableAccount
