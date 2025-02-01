import React, { useEffect, useState } from 'react'
import { Autocomplete, TextField, Chip } from '@mui/material'

interface KeywordInputProps {
  label: string
  placeholder?: string
  initialKeywords?: string[]
  onChange: (keywords: string[]) => void
}

const KeywordInput = (props: KeywordInputProps) => {
  // ** Props
  const { label, placeholder = '', onChange, initialKeywords = [] } = props

  // ** States
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)

  // ** Functions
  const handleKeywordsChange = (event: React.ChangeEvent<{}>, newValue: string[]) => {
    setKeywords(newValue)
    onChange(newValue)
  }

  useEffect(() => {
    setKeywords(initialKeywords)
  }, [initialKeywords])

  return (
    <div className='flex flex-col items-center space-y-4'>
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={keywords}
        onChange={handleKeywordsChange}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option} {...getTagProps({ index })} key={`chip-key-${index}`} color='primary' />
          ))
        }
        renderInput={params => <TextField {...params} variant='outlined' label={label} placeholder={placeholder} />}
        className='max-w-md'
      />
    </div>
  )
}

export default KeywordInput
