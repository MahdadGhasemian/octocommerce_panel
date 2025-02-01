// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableProduct from '@/components/tables/TableProduct'

// ** Services Import
import BasicService, { CategoryTree, PackagingCost } from '@/services/basic.service'

const Invoice = () => {
  // ** Hook

  // ** State
  const [categoriesTree, setCategoriesTree] = useState<Array<CategoryTree>>()
  const [packagingCostList, setPackagingCostList] = useState<Array<PackagingCost>>()

  useEffect(() => {
    const fetchData = async () => {
      const categoriesTree = await BasicService.getAllTree()
      const packagingCost = await BasicService.getAllPackagingCost()

      setCategoriesTree(categoriesTree)
      setPackagingCostList(packagingCost.data)
    }

    fetchData()
  }, [])

  if (!categoriesTree || !packagingCostList) return <></>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableProduct categoriesTree={categoriesTree} packagingCostList={packagingCostList} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
