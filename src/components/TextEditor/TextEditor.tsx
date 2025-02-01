// ** React Imports
import React, { Suspense, lazy, useState } from 'react'
import { useDropzone } from 'react-dropzone'

// ** MUI Imports
import { Box, Button, Card, Grid, LinearProgress, Typography, styled, useMediaQuery, useTheme } from '@mui/material'

// ** Editor Imports
import { EditorState, Modifier, convertToRaw } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import styles from './TextEditor.module.css' // Import component-level CSS module

// ** Icons Imports
import { FileUploadOutline } from 'mdi-material-ui'

// ** Services Import
import StorageService, { UploadFileResponse } from '@/services/storage.service'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError } from '@/redux/slices/snackbarSlice'

const DynamicEditor = lazy(() => import('react-draft-wysiwyg').then(module => ({ default: module.Editor })))

const SaveButton = styled(Button)({
  marginRight: '10px'
})

interface TextEditorProps {
  onSave: (text: string, text_follow: string) => void
  initialContent?: string
}

function getTextFromJSON(jsonString: string): string {
  try {
    const parsedJson = JSON.parse(jsonString)
    const blocks = parsedJson.blocks

    return blocks?.map((block: any) => block?.text).join(' ')
  } catch (error) {
    return ''
  }
}

const TextEditor: React.FC<TextEditorProps> = ({ onSave }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [activeButton, setActiveButton] = useState<boolean>(false)
  const [uploading, setUploading] = useState(false)

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isUnderMDScreen = useMediaQuery(theme.breakpoints.down('md'))

  // ** Store
  const { dispatch } = store

  const dataOk = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent()
    const rawContentState = convertToRaw(contentState)
    const text = JSON.stringify(rawContentState)
    const extractedText = getTextFromJSON(text)

    return { text, extractedText }
  }

  const handleTextChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState)
    setActiveButton(true)
  }

  const handleSaveClick = () => {
    const { text, extractedText } = dataOk(editorState)

    onSave(text, extractedText)
    setEditorState(EditorState.createEmpty())
    setActiveButton(false)
  }

  const handleFileUploadClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement
    fileInput.click()
  }

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length !== 0) {
      const file = acceptedFiles[0]

      if (file) {
        try {
          let uploadResponse: UploadFileResponse

          let tag = ''

          setUploading(true)

          try {
            uploadResponse = await StorageService.accessUploadFile(file)
            const { url } = uploadResponse
            const originalName = file.name?.split('.')?.shift() || 'فایل'

            tag = `![${originalName}](${url})`
          } catch (error) {
            dispatch(toastError('بارگذاری فایل با خطا مواجه شد، لطفا مجددا تلاش کنید.'))
          }

          setUploading(false)

          // Get the current editor state
          const currentEditorState = editorState

          // Get the current selection
          const selectionState = currentEditorState.getSelection()

          // Insert the image tag at the current selection
          const contentStateWithImage = Modifier.insertText(currentEditorState.getCurrentContent(), selectionState, tag)

          // Create a new editor state with the modified content
          const newEditorState = EditorState.push(currentEditorState, contentStateWithImage, 'insert-fragment')

          // Update the editor state with the image tag
          setEditorState(newEditorState)
          setActiveButton(true)
        } catch (error) {
          // Handle error if necessary
        }
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop, noClick: true })

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className={styles.textEditorWrapper} {...getRootProps()}>
          <input {...getInputProps()} id='fileInput' style={{ display: 'none' }} />
          {isDragActive ? (
            <Box display='flex' alignItems='center' justifyContent='center' sx={{ minHeight: '16rem' }}>
              <Typography>فایل را اینجا رها کنید تا آپلود شود</Typography>
            </Box>
          ) : (
            <Suspense fallback={<div>Loading Editor...</div>}>
              <Card style={{ position: 'relative' }}>
                {uploading && <LinearProgress />}
                <Button
                  variant='contained'
                  component='label'
                  color='primary'
                  style={{ position: 'absolute', top: 15, right: 15, zIndex: 1000 }}
                  onClick={handleFileUploadClick}
                >
                  <FileUploadOutline />
                  {!isUnderMDScreen && <span>آپلود فایل</span>}
                </Button>

                <DynamicEditor
                  editorState={editorState}
                  onEditorStateChange={handleTextChange}
                  toolbarClassName={styles.textEditorToolbar}
                  wrapperClassName={styles.textEditorContent}
                  editorClassName={styles.textEditorEditor}
                  toolbar={{
                    options: ['inline', 'list', 'textAlign', 'link', 'emoji'],
                    inline: {
                      options: ['bold', 'italic', 'underline']
                    }
                  }}
                />
              </Card>
            </Suspense>
          )}
        </div>
      </Grid>
      <Grid item xs={12}>
        {activeButton && (
          <SaveButton variant='contained' color='primary' onClick={handleSaveClick}>
            ذخیره
          </SaveButton>
        )}
      </Grid>
    </Grid>
  )
}

export default TextEditor
