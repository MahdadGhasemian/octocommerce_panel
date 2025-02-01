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
import TaskService, { Project } from '@/services/task.service'
import AuthService, { User } from '@/services/auth.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { isInternalUser } from '@/redux/slices/authSlice'
import { InputColumnFiltersModel } from '@/services/param'

const ButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TableProject = () => {
  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // ** Confirm
  const { confirm } = useConfirmation()

  // ** Global State
  const isAccess = useSelector(isInternalUser)

  // ** States
  const [data, setData] = useState<Project[]>([])
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [editRowData, setEditRowData] = useState<Project | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string
  }>({})

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
        const response = await TaskService.getAllProject(
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
    if (isAccess) loadUsers()
  }, [])

  const loadUsers = () => {
    const filters = [{ id: 'accesses.is_internal_user', value: true, operator: '$eq' }]

    AuthService.getAllUser(1000, 1, undefined, filters)
      .then(response => {
        // setUsers(response.data.filter(account => account.role !== Role.User))
        setUsers(response.data)
      })
      .catch(e => {
        e
      })
  }

  const handleCreateNewOrEditRow = async (values: Project) => {
    try {
      const project = Object.assign(values, users && { user_ids: values.users?.map(user => user.id) })

      if (values?.id) {
        await TaskService.editProject(values.id, project)
      } else {
        await TaskService.createProject(project)
      }

      setRefreshKey(key => key + 1)
    } catch (error) {}
  }

  const handleEditModal = (row: MRT_Row<Project>) => {
    setEditRowData(row.original)
    setCreateModalOpen(true)
  }

  const handleModalClosed = () => {
    setCreateModalOpen(false)
  }

  const handleSaveRowEdits: MaterialReactTableProps<Project>['onEditingRowSave'] = async ({
    exitEditingMode,
    values
  }) => {
    if (!Object.keys(validationErrors).length) {
      try {
        await TaskService.editProject(values.id, Object.assign(values))

        setRefreshKey(key => key + 1)
      } catch (error) {}

      exitEditingMode()
    }
  }

  const handleCancelRowEdits = () => {
    setValidationErrors({})
  }

  const handleDeleteRow = useCallback(async (row: MRT_Row<Project>) => {
    const id: number = row.getValue('id')
    const name = row.original.title

    if (id) {
      confirm({ groupName: 'گروه کاری', name })
        .then(async () => {
          try {
            await TaskService.deleteProject(id)

            setRefreshKey(key => key + 1)
          } catch (error) {}
        })
        .catch()
    }
  }, [])

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<Project>): MRT_ColumnDef<Project>['muiTableBodyCellEditTextFieldProps'] => {
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

  const columns = useMemo<MRT_ColumnDef<Project>[]>(
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
        accessorKey: 'description',
        header: 'توضیح',
        size: 300
      },
      {
        accessorKey: 'users',
        header: 'کاربران',
        id: 'users',
        size: 500,
        Cell: ({ row }) => (
          <Stack direction='row' justifyContent='start' alignItems='start' spacing={2}>
            {row.original?.users
              ?.sort((a, b) => +a.id - +b.id)
              .map(user => (
                <Chip
                  key={user.id}
                  avatar={
                    <Avatar
                      alt={user?.last_name}
                      src={`${user.avatar}?width=120`}
                      imgProps={{ crossOrigin: 'use-credentials' }}
                      sx={{ width: '2.5rem', height: '2.5rem' }}
                    />
                  }
                  label={`${user?.first_name || ''} ${user?.last_name || ''}`}
                  variant='outlined'
                />
              ))}
          </Stack>
        )
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
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
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
            onClick={() => setCreateModalOpen(true)}
            size={isSmallScreen ? 'small' : 'large'}
          >
            ایجاد گروه کاری جدید
          </ButtonStyled>
        )}
      />
      <CreateNewProjectModal
        columns={columns}
        open={createModalOpen}
        onClose={() => handleModalClosed()}
        onSubmit={handleCreateNewOrEditRow}
        userList={users}
        editRowData={editRowData}
      />
    </>
  )
}

interface CreateModalProps {
  columns: MRT_ColumnDef<Project>[]
  onClose: () => void
  onSubmit: (values: Project) => void
  open: boolean
  userList: User[]
  editRowData: Project | null
}

export const CreateNewProjectModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  userList,
  editRowData
}: CreateModalProps) => {
  const [users, setUsers] = useState<User[]>([])
  const [values, setValues] = useState<any>(() =>
    columns
      .filter(column => column.id !== 'id')
      .reduce((acc, column) => {
        acc[column.accessorKey ?? ''] = ''

        return acc
      }, {} as any)
  )

  useEffect(() => {
    if (editRowData) {
      setValues({ ...editRowData })
      setUsers(editRowData.users as any)
    }
  }, [editRowData])

  const handleSubmit = () => {
    onSubmit(JSON.parse(JSON.stringify({ ...values, users })))
    setValues({
      title: '',
      description: '',
      users: []
    })
    setUsers([])
    onClose()
  }

  const handleUserChange = (users: User[]) => {
    setUsers(users)
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>گروه کاری</DialogTitle>
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
                column.accessorKey === 'users' ? (
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
        <Button onClick={onClose}>انصراف</Button>
        <ButtonStyled component='label' variant='contained' onClick={handleSubmit}>
          ذخیره
        </ButtonStyled>
      </DialogActions>
    </Dialog>
  )
}

const validateRequired = (value: string) => !!value.length

export default TableProject
