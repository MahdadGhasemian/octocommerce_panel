// ** React Imports
import React, { FC, Fragment, useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import {
  Button,
  IconButton,
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  Slide,
  Checkbox,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'

// ** Icons Imports
import { CloseCircleOutline } from 'mdi-material-ui'

// ** MaterialReactTable Imports
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table'
import { MRT_Localization_FA } from 'material-react-table/locales/fa'

// ** Services Import
import AuthService, { Access, AccessInfoEndpoint } from '@/services/auth.service'

//
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

type Props = {
  access: Access
  open: boolean
  onClose: () => void
}

const AccessDialog: FC<Props> = (props: Props) => {
  // ** Props
  const { access, open, onClose } = props

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const columnPinning = isSmallScreen ? { left: ['tag'] } : {}

  // ** States
  const [data, setData] = useState<AccessInfoEndpoint[]>([])

  useEffect(() => {
    if (access?.info_endpoints) setData(access.info_endpoints)
  }, [access])

  const handleCheckboxChange = (key: string, method: string, value: boolean) => {
    setData(prevData =>
      prevData.map(item =>
        item.key === key
          ? {
              ...item,
              [method]: value
            }
          : item
      )
    )
  }

  const handleClose = () => {
    onClose()
  }

  const handleSaveAccess = async () => {
    try {
      if (access?.id) {
        const editedAccess = access
        editedAccess.info_endpoints = data
        await AuthService.editAccess(Number(access.id), editedAccess)
      }
    } catch (error) {}

    onClose()
  }

  const columns = useMemo<MRT_ColumnDef<AccessInfoEndpoint>[]>(
    () => [
      {
        accessorKey: 'tag',
        header: 'عنوان'
      },
      {
        accessorKey: 'get',
        header: 'خواندن',
        Cell: ({ cell, row }) => (
          <Checkbox
            checked={Boolean(cell.getValue())}
            onChange={event => handleCheckboxChange(row.original.key, 'get', event.target.checked)}
          />
        )
      },
      {
        accessorKey: 'post',
        header: 'افزودن',
        Cell: ({ cell, row }) => (
          <Checkbox
            checked={Boolean(cell.getValue())}
            onChange={event => handleCheckboxChange(row.original.key, 'post', event.target.checked)}
          />
        )
      },
      {
        accessorKey: 'patch',
        header: 'ویرایش',
        Cell: ({ cell, row }) => (
          <Checkbox
            checked={Boolean(cell.getValue())}
            onChange={event => handleCheckboxChange(row.original.key, 'patch', event.target.checked)}
          />
        )
      },
      {
        accessorKey: 'delete',
        header: 'پاک کردن',
        Cell: ({ cell, row }) => (
          <Checkbox
            checked={Boolean(cell.getValue())}
            onChange={event => handleCheckboxChange(row.original.key, 'delete', event.target.checked)}
          />
        )
      }
    ],
    []
  )

  return (
    <Fragment>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
              <CloseCircleOutline />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              {access?.title}
            </Typography>
            <Button autoFocus color='inherit' onClick={handleSaveAccess}>
              ذخیره
            </Button>
          </Toolbar>
        </AppBar>

        <MaterialReactTable
          columns={columns}
          data={data}
          enableRowSelection={false}
          initialState={{
            showColumnFilters: false,
            expanded: true,
            columnPinning
          }}
          enableHiding={false}
          enableColumnActions={false}
          enableColumnFilters={false}
          enablePagination={false}
          enableSorting={false}
          localization={MRT_Localization_FA}
          muiTableBodyRowProps={{
            sx: theme => ({
              background: theme.palette.background.paper
            })
          }}
          enableColumnOrdering
          enableEditing={false}
        />
      </Dialog>
    </Fragment>
  )
}

export default AccessDialog
