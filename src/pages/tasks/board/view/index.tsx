// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import Head from 'next/head'

// ** MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  styled,
  TypographyProps,
  Divider,
  Chip,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  ButtonProps,
  Autocomplete,
  Grid,
  BoxProps,
  IconButton
} from '@mui/material'
import MuiAvatar, { AvatarProps } from '@mui/material/Avatar'
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab'
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent'

// ** Import Icons
import { Pencil, SelectGroup } from 'mdi-material-ui'

// ** Services Import
import TaskService, { Board, ContentType } from '@/services/task.service'
import { fromNow } from '@/utils/from-now'

// ** Import libraries
import moment from 'moment-jalaali'

// ** Import components
import TextEditor from '@/components/TextEditor/TextEditor'
import ShowText from '@/components/TextEditor/ShowText'
import { User } from '@/services/auth.service'

// ** Styled components
const Avatar = styled(MuiAvatar)<AvatarProps>({
  width: '2rem',
  height: '2rem',
  fontSize: '1.125rem'
})

const TextTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 700,
  overflow: 'hidden',
  fontSize: '1.2rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75)
}))

const TextDescription = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 700,
  overflow: 'hidden',
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75)
}))

const TextSubtitle = styled(Typography)<TypographyProps>({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

const TextDetail = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  overflow: 'hidden',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75)
}))

const ButtonEdit = styled(Button)<ButtonProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    // marginTop: 6
  }
}))

const BoxAssign = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'end'
  }
}))

export type BoardDataType = {
  editMode: boolean
  board_id?: number
  title?: string
  description?: string
  group_id?: number
  change_on_general_data?: boolean
}

const BoardView = () => {
  const router = useRouter()
  const [accounts, setAccounts] = useState<User[] | null>(null)
  const [assignedTo, setAssignedTo] = useState<User | null>(null)
  const [board, setBoard] = useState<Board>()
  const [boardEditMode, setBoardEditMode] = useState<BoardDataType>({ editMode: false })
  const { id } = router.query

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    if (id) {
      loadBoardData(Number(id))
    }
  }, [id])

  const loadBoardData = async (id: number) => {
    try {
      const board = await TaskService.getBoard(id)
      setBoard(board)
      setAssignedTo(board.assigned_to)
      if (board.project?.users) setAccounts(board.project.users)
    } catch (e) {}
  }

  const activeEditBoard = (board: Board) => {
    setBoardEditMode({
      editMode: true,
      board_id: board.id,
      title: board.title,
      description: board.description
    })
  }

  const handleEditBoard = async () => {
    if (!boardEditMode?.editMode || !boardEditMode?.board_id) return

    try {
      const editedData: {
        title?: string
        description?: string
        assigned_to_user_id?: number
      } = {}

      if (boardEditMode.change_on_general_data) {
        editedData.title = boardEditMode.title
        editedData.description = boardEditMode.description
      }
      if (assignedTo?.id) {
        editedData.assigned_to_user_id = +assignedTo?.id
      }

      await TaskService.editBoard(boardEditMode.board_id, editedData)

      loadBoardData(boardEditMode.board_id)
    } catch (error) {}

    setBoardEditMode({
      editMode: false,
      change_on_general_data: false
    })
  }

  const handleCancelEditBoard = async () => {
    setAssignedTo(null)
    setBoardEditMode({ ...boardEditMode, editMode: false })
  }

  const handleAddComment = async (text: string, text_follow: string) => {
    if (!board?.id) return

    try {
      await TaskService.createComment(board.id, {
        content: text,
        content_follow: text_follow
      })

      loadBoardData(board.id)
    } catch (error) {}
  }

  const handelChangeAssignedTo = async (account: User | null) => {
    setAssignedTo(account)
  }

  if (!board) {
    return (
      <div>
        <Card>
          <CardContent>
            <p>در حال آماده سازی اطلاعات ...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{`کار شماره ${id}`}</title>
      </Head>

      <Container>
        <Stack direction='row' justifyContent='start' alignItems='center' spacing={2}>
          <IconButton color='secondary' size='small'>
            <SelectGroup />
          </IconButton>
          <TextSubtitle sx={{ marginX: 1 }}>{board.project?.title}</TextSubtitle>
        </Stack>

        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                <TextDetail sx={{ marginX: 1 }}>{fromNow(board.created_at)}</TextDetail>
                <TextSubtitle sx={{ marginX: 1 }}>توسط</TextSubtitle>
                <Avatar
                  alt={board.created_by.first_name}
                  src={`${board.created_by.avatar}?width=120`}
                  imgProps={{ crossOrigin: 'use-credentials' }}
                  sx={{ marginX: 1 }}
                />
                <TextDetail sx={{ marginX: 1 }}>
                  {board.created_by?.first_name || ''} {board.created_by?.last_name || ''}
                </TextDetail>
                {!isSmallScreen && <TextSubtitle sx={{ marginX: 1 }}>ایجاد شده است.</TextSubtitle>}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <BoxAssign sx={{ display: 'flex', alignItems: 'center' }}>
                <TextSubtitle sx={{ marginX: 1 }}>مجری :</TextSubtitle>
                <Avatar
                  alt={board.assigned_to?.first_name}
                  src={`${board.assigned_to?.avatar}?width=120`}
                  imgProps={{ crossOrigin: 'use-credentials' }}
                  sx={{ marginX: 1 }}
                />
                <TextDetail sx={{ marginX: 1 }}>
                  {board.assigned_to?.first_name || ''} {board.assigned_to?.last_name || ''}
                </TextDetail>
              </BoxAssign>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ mt: 4, mb: 8 }} />

        <Box sx={{ minHeight: 200 }}>
          {!boardEditMode.editMode ? (
            <div>
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextTitle sx={{ marginX: 1 }}>{board.title}</TextTitle>
                <ButtonEdit
                  variant='contained'
                  color='secondary'
                  onClick={() => {
                    activeEditBoard(board)
                  }}
                  size='small'
                >
                  <Pencil />
                  {!isSmallScreen && <span>اصلاح</span>}
                </ButtonEdit>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'start',
                  mt: 2,
                  paddingLeft: 4
                }}
              >
                <TextDescription sx={{ marginX: 1, whiteSpace: 'pre-line' }}>{board.description}</TextDescription>
              </Box>
            </div>
          ) : (
            <>
              <Grid container spacing={4} marginY={4}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoFocus
                    fullWidth
                    label='عنوان'
                    sx={{ marginX: 1 }}
                    value={boardEditMode.title}
                    onChange={e =>
                      setBoardEditMode({ ...boardEditMode, title: e.target.value, change_on_general_data: true })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    id='کاربر'
                    value={assignedTo}
                    getOptionLabel={account => `${account.first_name || ''} ${account.last_name || ''}`}
                    options={accounts || []}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    noOptionsText={'هیچ آیتمی موجود نیست'}
                    renderOption={(props, account) => (
                      <Box component='li' {...props} key={account.id} sx={{ gap: 4 }}>
                        <Avatar
                          alt={`${account.first_name || ''} ${account.last_name || ''}`}
                          sx={{ width: '2.5rem', height: '2.5rem' }}
                          src={`${account?.avatar}?width=120`}
                          imgProps={{ crossOrigin: 'use-credentials' }}
                        />
                        {`${account.first_name || ''} ${account.last_name || ''}`}
                      </Box>
                    )}
                    renderInput={params => <TextField {...params} label='کاربر' />}
                    onChange={(_, account) => handelChangeAssignedTo(account)}
                    clearOnEscape
                    fullWidth
                    sx={{ marginX: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    autoFocus
                    fullWidth
                    label='توضیح'
                    sx={{ marginX: 1 }}
                    value={boardEditMode.description}
                    onChange={e =>
                      setBoardEditMode({ ...boardEditMode, description: e.target.value, change_on_general_data: true })
                    }
                    minRows={4}
                    multiline
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'start',
                  marginTop: 4,
                  gap: 8,
                  marginX: 1
                }}
              >
                <Button type='submit' variant='contained' onClick={handleEditBoard}>
                  ذخیره
                </Button>
                <Button type='submit' variant='contained' color='secondary' onClick={() => handleCancelEditBoard()}>
                  انصراف
                </Button>
              </Box>
            </>
          )}
        </Box>

        <Divider sx={{ mt: 4, mb: 8 }} />

        <Box>
          <TextTitle sx={{ marginX: 1 }}>فعالیت ها</TextTitle>
        </Box>

        <Timeline
          position='right'
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.1
            }
          }}
        >
          {board.comments.map(comment =>
            comment?.content?.content_type === ContentType.NewGroup ||
            comment?.content?.content_type === ContentType.ChangeUserAssign ||
            comment?.content?.content_type === ContentType.ChangeGeneralData ? (
              <TimelineItem key={comment.id}>
                <TimelineOppositeContent sx={{ m: 'auto 0' }} align='right' variant='body2' color='text.secondary'>
                  {moment(comment.created_at).format('HH:mm jMM/jDD')}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot>
                    <Avatar
                      alt={comment.created_by?.first_name}
                      src={`${comment.created_by?.avatar}?width=120`}
                      imgProps={{ crossOrigin: 'use-credentials' }}
                    />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  {comment.content.content_type === ContentType.NewGroup ? (
                    <>
                      <Typography variant='h6' component='span'>
                        <Chip
                          label={comment.content?.group?.label?.title}
                          style={{ backgroundColor: `${comment.content?.group?.label?.background_color}` }}
                          size='small'
                        />
                      </Typography>
                      <Typography>انتقال به گروه جدید</Typography>
                    </>
                  ) : comment.content.content_type === ContentType.ChangeUserAssign ? (
                    <>
                      <Typography variant='h6' component='span'>
                        <Chip
                          label={`${comment.created_by?.first_name || ''} ${comment.created_by?.last_name || ''}`}
                          color='info'
                          size='small'
                        />
                      </Typography>
                      <Typography>تغییر کاربر مجری</Typography>
                    </>
                  ) : (
                    <Typography>تغییر اطلاعات</Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            ) : (
              comment?.content?.content_type === ContentType.UserComment &&
              (isSmallScreen ? (
                <Box sx={{ marginTop: 8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', marginBottom: 2 }}>
                    <Stack direction='row' sx={{ gap: 2 }}>
                      {moment(comment.created_at).format('HH:mm jMM/jDD')}
                      <Avatar
                        alt={comment.created_by?.first_name}
                        src={`${comment.created_by?.avatar}?width=120`}
                        imgProps={{ crossOrigin: 'use-credentials' }}
                      />
                    </Stack>
                  </Box>
                  {comment?.content?.content && (
                    <ShowText
                      content={comment.content.content}
                      sx={{
                        border: 0,
                        boxShadow: 3,
                        paddingX: 2,
                        margin: 0
                      }}
                    />
                  )}
                </Box>
              ) : (
                <TimelineItem key={comment.id}>
                  <TimelineOppositeContent sx={{ m: 'auto 0' }} align='right' variant='body2' color='text.secondary'>
                    {moment(comment.created_at).format('HH:mm jMM/jDD')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineConnector />
                    <TimelineDot>
                      <Avatar
                        alt={comment.created_by?.first_name}
                        src={`${comment.created_by?.avatar}?width=120`}
                        imgProps={{ crossOrigin: 'use-credentials' }}
                      />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    {comment?.content?.content && (
                      <ShowText
                        content={comment.content.content}
                        sx={{
                          border: 1,
                          boxShadow: 3,
                          paddingX: 2,
                          margin: 0
                        }}
                      />
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))
            )
          )}
        </Timeline>

        <Divider sx={{ mt: 4, mb: 8 }} />

        <TextEditor onSave={handleAddComment} />
      </Container>
    </>
  )
}

export default BoardView
