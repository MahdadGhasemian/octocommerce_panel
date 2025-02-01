// ** React Imports
import React from 'react'

// ** MUI Imports
import { Box, IconButton } from '@mui/material'

// ** Icons Imports
import { FileDownload, FileDownloadOutline } from 'mdi-material-ui'

// ** Import libraries
import * as ExcelJS from 'exceljs'
import moment from 'moment-jalaali'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError } from '@/redux/slices/snackbarSlice'

const getExcelColumnLetter = (index: number): string => {
  let letter = ''
  let dividend = index + 1

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26
    letter = String.fromCharCode(65 + modulo) + letter
    dividend = Math.floor((dividend - modulo) / 26)
  }

  return letter
}

interface ExportButtonProps {
  selectedData: any[]
  columns: any[]
  filePreName: string
  fetchData: any
}

const ExportButton = ({ selectedData, columns, filePreName, fetchData }: ExportButtonProps) => {
  // ** Store
  const { dispatch } = store

  const filterFields = (data: any[], headers: string[]): any[] => {
    const filteredData: any[] = []

    for (const entry of data) {
      const filteredEntry: any = {}

      for (const column of headers) {
        if (column in entry) {
          filteredEntry[column] = entry[column]
        }
      }

      filteredData.push(filteredEntry)
    }

    return filteredData
  }

  const handleExportData = async (data: any[]) => {
    const headerNames: string[] = columns.map(c => c.header as string)
    const headerIds: string[] = columns.map(c => c.accessorKey as string)
    const dataFiltered = filterFields(data, headerIds)

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')
    worksheet.views = [{ rightToLeft: true }]

    // Set bold font for header row
    const headerRow = worksheet.addRow(headerNames)
    headerRow.font = { bold: true }

    headerRow.eachCell((cell, cellNumber) => {
      const headerId = headerIds[cellNumber - 1]
      const column = columns.find(col => col.accessorKey === headerId)

      // Set header value
      cell.value = column?.header || ''
    })

    // Add fields
    dataFiltered.forEach(entry => {
      const values = headerIds.map(headerId => {
        const value = entry[headerId]

        const column = columns.find(column => column.accessorKey === headerId)

        if (typeof column?.exportData?.accessorFn === 'function') {
          return column.exportData.accessorFn(entry)
        }

        return value
      })

      worksheet.addRow(values)
    })

    // Adjust column widths
    headerIds.forEach((headerId, index) => {
      const exportData = columns[index]?.exportData
      const width = exportData?.width
      if (width) {
        worksheet.getColumn(index + 1).width = width
      }
    })

    columns.forEach((column, columnIndex) => {
      if (column.exportData?.isCurrency) {
        const columnLetter = getExcelColumnLetter(columnIndex)
        const columnCells = worksheet.getColumn(columnLetter)
        columnCells.eachCell(cell => {
          cell.numFmt = '#,##'
        })
      }
    })

    const fileName = `${filePreName}-${moment().format('jYYYY_jMM_jDD_hh_mm')}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()
    const dataBlob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    if (typeof window !== 'undefined' && (window.navigator as any).msSaveOrOpenBlob) {
      // For IE browser
      ;(window.navigator as any).msSaveOrOpenBlob(dataBlob, fileName)
    } else {
      // For modern browsers
      const downloadLink = document.createElement('a')
      const url = URL.createObjectURL(dataBlob)

      downloadLink.href = url
      downloadLink.download = fileName
      downloadLink.click()

      URL.revokeObjectURL(url)
    }
  }

  const handleExportAllData = async () => {
    try {
      const data = await fetchData()
      handleExportData(data)
    } catch (error) {
      dispatch(toastError('هنگام خروجی گرفتن فایل خطایی رخ داد!'))
    }
  }

  return (
    <Box>
      <IconButton
        onClick={() => {
          handleExportData(selectedData)
        }}
        color='secondary'
      >
        <FileDownload />
      </IconButton>
      <IconButton onClick={handleExportAllData} color='secondary'>
        <FileDownloadOutline />
      </IconButton>
    </Box>
  )
}

export default ExportButton
