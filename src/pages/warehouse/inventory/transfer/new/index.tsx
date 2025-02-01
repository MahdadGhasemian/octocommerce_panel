// ** React Imports
import { ElementType, useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import {
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Box,
  TextField,
  styled,
  Button,
  ButtonProps,
  Divider,
  Typography,
  CardActions
} from '@mui/material'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError } from '@/redux/slices/snackbarSlice'

// ** Services Import
import BasicService, {
  Inventory,
  InventoryItem,
  InventoryType,
  MaterialUnit,
  Warehouse
} from '@/services/basic.service'

// ** Icons Imports
import { Plus } from 'mdi-material-ui'

// ** Date Picker Import
import { DatePicker } from '@mui/x-date-pickers'

// ** Components Imports
import { InventoryItemType } from '@/components/ProductSelect'
import StockSelect from '@/components/StockSelect'

// ** Styled components
const ButtonAllStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const generateRandom = () => {
  return Math.random().toString()
}

const InventoryTransferCreate = () => {
  // ** Hook
  const router = useRouter()

  // ** Store
  const { dispatch } = store

  // ** States
  const [warehouseList, setWarehouseList] = useState<Array<Warehouse>>([])
  const [inventory, setInventory] = useState<Partial<Inventory> & Partial<InventoryItem>>()
  const [inventoryItem, setInventoryItem] = useState<Array<InventoryItemType>>()

  useEffect(() => {
    const fetchData = async () => {
      const warehouses = await BasicService.getAllWarehouse()

      setWarehouseList(warehouses.data)
    }

    fetchData()
  }, [])

  const handleRemoveItem = (item: InventoryItemType) => {
    setInventoryItem(prev => {
      return prev?.filter(_ => _.random !== item.random)
    })
  }

  const handleAddItem = () => {
    setInventoryItem(prev => {
      const newData: InventoryItemType[] = [{ random: generateRandom() }]

      return prev?.length ? prev.concat(newData) : newData
    })
  }

  const handleChangeItem = (item: InventoryItemType) => {
    setInventoryItem(prev => {
      if (prev) {
        const index = prev.findIndex(i => i.random === item.random)
        if (index >= 0) {
          prev[index] = item
        }
      }

      return prev
    })
  }

  const handleSaveInventory = async () => {
    if (!inventory?.warehouse_from || !inventory.warehouse_to) {
      return dispatch(toastError('لطفا انبار را انتخاب نمایید.'))
    }
    if (!inventoryItem?.length) {
      return dispatch(toastError('لطفا حداقل یک کالا را انتخاب نمایید.'))
    }

    const warehouse_from_id = inventory.warehouse_from?.id
    const warehouse_to_id = inventory?.warehouse_to?.id

    const inventoryData: Partial<Inventory> & { warehouse_id_2?: number } = {
      inventory_number: inventory?.inventory_number,
      inventory_date: inventory?.inventory_date,
      inventory_type: InventoryType.Transfer,
      warehouse_from_id,
      warehouse_to_id,
      inventory_items: inventoryItem?.map(item => {
        return {
          product_id: item.product?.id,
          unit: item.unit || MaterialUnit.Device,
          quantity: item.quantity || 1,
          description: item.description
        } as InventoryItem
      }),
      inventory_description: inventory.inventory_description
    }

    try {
      await BasicService.createInventory(inventoryData)
      handleReturnToList()
    } catch (error) {}
  }

  const handleReturnToList = () => {
    router.push(`/warehouse/inventory/transfer`)
  }

  return (
    <Card
      sx={{
        mx: 'auto',
        '@media (min-width:1440px)': { maxWidth: 1440 },
        '@media (min-width:1200px)': { maxWidth: '100%' }
      }}
    >
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type='text'
              label='حواله انتقال'
              defaultValue={inventory?.inventory_number}
              onChange={e => setInventory({ ...inventory, inventory_number: Number(e.target.value || 0) })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              sx={{ width: '100%' }}
              label='تاریخ انتقال'
              value={inventory?.inventory_date ? new Date(inventory.inventory_date) : null}
              onChange={value => setInventory({ ...inventory, inventory_date: value?.toISOString() ?? '' })}
            />
          </Grid>
          <Grid item xs={12} md={4}></Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              id='warehouse_from'
              value={inventory?.warehouse_from}
              options={warehouseList}
              getOptionLabel={warehouse => `${warehouse.title}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={'هیچ آیتمی موجود نیست'}
              renderOption={(props, warehouse) => (
                <Box
                  component='li'
                  {...props}
                  key={warehouse.title}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme => theme.palette.divider
                    }
                  }}
                >
                  {warehouse.title}
                </Box>
              )}
              renderInput={params => <TextField {...params} label='از انبار' />}
              onChange={(_, value) => setInventory({ ...inventory, warehouse_from: value ? value : undefined })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              id='warehouse_to'
              value={inventory?.warehouse_to}
              options={warehouseList}
              getOptionLabel={warehouse => `${warehouse.title}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={'هیچ آیتمی موجود نیست'}
              renderOption={(props, warehouse) => (
                <Box
                  component='li'
                  {...props}
                  key={warehouse.title}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme => theme.palette.divider
                    }
                  }}
                >
                  {warehouse.title}
                </Box>
              )}
              renderInput={params => <TextField {...params} label='به انبار' />}
              onChange={(_, value) => setInventory({ ...inventory, warehouse_to: value ? value : undefined })}
            />
          </Grid>
        </Grid>

        <Divider flexItem sx={{ py: 2, mx: 16 }} />

        <Typography variant='body1' sx={{ pb: 4 }}>
          کالا :
        </Typography>

        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Box sx={{ margin: 0 }}>
              {inventoryItem?.map((item: InventoryItemType) => (
                <StockSelect
                  key={item.random}
                  warehouseId={inventory?.warehouse_from?.id}
                  item={item}
                  handleChangeItem={v => handleChangeItem(v)}
                  handleRemoveItem={v => handleRemoveItem(v)}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ marginY: 5, marginX: 5 }}>
              <ButtonAllStyled variant='outlined' color='success' onClick={() => handleAddItem()}>
                جدید
                <Plus />
              </ButtonAllStyled>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Grid container spacing={4} sx={{ marginTop: 10 }}>
          <Grid item xs={12} md={2}>
            <Button variant='contained' fullWidth onClick={handleSaveInventory}>
              ذخیره حواله انتقال
            </Button>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button type='reset' variant='outlined' color='secondary' fullWidth onClick={handleReturnToList}>
              بازگشت به لیست
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  )
}

export default InventoryTransferCreate
