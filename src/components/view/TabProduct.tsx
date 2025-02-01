// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Grid, Card, CardContent, Box } from '@mui/material'

// ** Services Import
import BasicService, { Order, Warehouse } from '@/services/basic.service'

// ** Components Imports
import OrderStockSelect, { OrderStockSelectDataType } from '@/components/OrderStockSelect'

const generateRandom = () => {
  return Math.random().toString()
}

const convertData = (order: Order): Array<OrderStockSelectDataType> => {
  const data: OrderStockSelectDataType[] = []
  for (const orderItem of order.order_items) {
    const quantity = orderItem.quantity
    for (let i = 0; i < quantity; i++) {
      const inventory_item = orderItem?.inventory_items?.length ? orderItem.inventory_items[0] : undefined
      const warehouse = inventory_item?.warehouse
      const inventory_date = inventory_item?.inventory?.inventory_date
        ? new Date(inventory_item.inventory.inventory_date)
        : undefined

      const new_item: OrderStockSelectDataType = {
        random: generateRandom(),
        orderItem,
        product: orderItem.product,
        selectedStockInfo: {
          product: orderItem.product
        },
        warehouse,
        description: inventory_item?.description,
        inventory_date,
        isAlreadyDone: !!inventory_item
      }
      data.push(new_item)
    }
  }

  return data
}

export type Props = {
  order: Order
  isSmallScreen: boolean
}

const TabProduct = (props: Props) => {
  // ** Props
  const { order, isSmallScreen } = props

  // ** Hok

  // ** States
  const [warehouseList, setWarehouseList] = useState<Array<Warehouse>>([])

  const inventoryItem: Array<OrderStockSelectDataType> = convertData(order)

  useEffect(() => {
    const fetchData = async () => {
      const warehouses = await BasicService.getAllWarehouse()

      setWarehouseList(warehouses.data)
    }

    fetchData()
  }, [])

  return (
    <CardContent sx={{ padding: isSmallScreen ? 1 : 5 }}>
      <Card sx={{ paddingBottom: 10, paddingTop: 5 }}>
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Box sx={{ margin: 0 }}>
                {inventoryItem?.map((item: OrderStockSelectDataType) => (
                  <OrderStockSelect key={item.random} warehouseList={warehouseList} item={item} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </CardContent>
  )
}

export default TabProduct
