// ** React Imports
import React, { useState, useEffect, useImperativeHandle, forwardRef, Ref } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** Drag and Drop Imports
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// ** MUI Imports
import {
  Box,
  IconButton,
  Typography,
  Stack,
  StackProps,
  styled,
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  Autocomplete,
  Chip,
  Avatar,
  DialogTitle,
  TypographyProps
} from '@mui/material'

// ** Icons Imports
import { Plus, Delete, Pencil, Close, Send, TrashCanOutline } from 'mdi-material-ui'

// ** Services Import
import TaskService, { Board, Group, Label, Project, TaskPriority } from '@/services/task.service'

// ** Componnet Imports
import Empty from '../Empty'
import { InputColumnFiltersModel } from '@/services/param'

// ** Styled Components
const StackStyled = styled(Stack)<StackProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: { width: '18rem' },
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const StyledDescreption = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  overflow: 'hidden',
  whiteSpace: 'normal',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(1),

  '& span.groupName': {
    fontWeight: 900
  },

  '& span.name': {
    color: 'red',
    fontStyle: 'italic'
  }
}))

const LinkTitleStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.text.primary
}))

export type NewTaskType = {
  dialogIsActive: boolean
  taskTitle?: string
  project?: Project
  group_id?: number
  board_sequence_number?: number
}

export type GroupDataType = {
  addDialogIsActive?: boolean
  deleteDialogIsActive?: boolean
  editDialogIsActive?: boolean
  title?: string
  description?: string
  group_id?: number
  label?: Label
}

export type Props = {
  editMode: boolean
  projects: Project[]
  project_filter?: Project | null
}

export interface KanbanAppRef {
  triggerNewGroup: () => void
}

const KanbanApp = forwardRef<KanbanAppRef, Props>((props: Props, ref: Ref<KanbanAppRef>) => {
  // ** Props
  const { editMode, projects, project_filter } = props

  // ** States
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [noData, setNoData] = useState<boolean>(false)
  const [tasks, setTasks] = useState<Board[]>([])
  const [columns, setColumns] = useState<Group[]>([])
  const [newTaskDialog, setNewTaskDialog] = useState<NewTaskType>({
    dialogIsActive: false
  })
  const [groupDialog, setGroupDialog] = useState<GroupDataType>({
    addDialogIsActive: false,
    deleteDialogIsActive: false,
    editDialogIsActive: false
  })
  const [labels, setLabels] = useState<Label[] | null>(null)

  useImperativeHandle(ref, () => ({
    triggerNewGroup() {
      handleNewGroupDialog()
    }
  }))

  useEffect(() => {
    loadTasks()
    loadColumns()
    loadLables()
  }, [project_filter])

  const loadTasks = () => {
    const filters: InputColumnFiltersModel[] | undefined = project_filter?.id
      ? [{ id: 'project.id', value: project_filter?.id, operator: '$eq' }]
      : undefined

    TaskService.getAllBoard(1000, 1, undefined, filters)
      .then(response => {
        setTasks(response.data)
      })
      .catch(e => {
        e
      })
  }

  const loadColumns = () => {
    TaskService.getAllGroup()
      .then(response => {
        setColumns(response.data)
        setIsLoaded(true)
      })
      .catch(e => {
        e
        setIsLoaded(true)
        setNoData(true)
      })
  }

  const loadLables = () => {
    TaskService.getAllLabel()
      .then(response => {
        setLabels(response.data)
      })
      .catch(e => {
        e
      })
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const sourceColumnId = result.source.droppableId
    const destinationColumnId = result.destination.droppableId
    const taskId = result.draggableId
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceColumnId === destinationColumnId) {
      // Reordering tasks within the same column
      const reorderedTasks = Array.from(tasks)
      const columnTasks = reorderedTasks.filter(task => task.group_id === Number(sourceColumnId))

      const [removedTask] = columnTasks.splice(sourceIndex - 1, 1)
      columnTasks.splice(destinationIndex - 1, 0, removedTask)

      // Update the sequence number of tasks within the same column
      const updatedTasks = columnTasks.map((task, index) => ({
        ...task,
        board_sequence_number: index + 1
      }))

      // Update the state with reordered tasks
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.group_id === Number(sourceColumnId)) {
            return updatedTasks.find(updatedTask => updatedTask.id === task.id) || task
          }

          return task
        })
      )

      // Update the sequence numbers of tasks using the service's API
      const updatedTasksWithSequence = updatedTasks.map(task => ({
        board_id: task.id,
        board_sequence_number: task.board_sequence_number
      }))

      TaskService.editMultipleBoard(updatedTasksWithSequence)
        .then(() => {
          // Tasks reordered within the same column have been updated
        })
        .catch(e => {
          e
        })
    } else {
      // Moving tasks between columns
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === Number(taskId)) {
            return { ...task, board_sequence_number: 0, group_id: Number(destinationColumnId) }
          } else return task
        })
      )

      //
      let sourceIndex = 0
      let destinationIndex = 0
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.group_id === Number(sourceColumnId)) {
            const board_sequence_number = sourceIndex++ + 1

            return {
              ...task,
              board_sequence_number
            }
          } else if (task.group_id === Number(destinationColumnId)) {
            const board_sequence_number = destinationIndex++ + 1

            return {
              ...task,
              board_sequence_number
            }
          } else return task
        })
      )

      const updatedTasks: Partial<Board>[] = (
        tasks
          ?.filter(task => task.group_id === Number(sourceColumnId) || task.group_id === Number(destinationColumnId))
          ?.map(task => {
            if (task.id === Number(taskId)) {
              return { ...task, board_sequence_number: 0, group_id: Number(destinationColumnId) }
            } else return task
          })
          ?.sort((a: Board, b: Board) => a.board_sequence_number - b.board_sequence_number)
          ?.map(task => {
            if (task.group_id === Number(sourceColumnId)) {
              const board_sequence_number = sourceIndex++ + 1

              return { board_id: task.id, board_sequence_number, group_id: task.group_id }
            } else if (task.group_id === Number(destinationColumnId)) {
              const board_sequence_number = destinationIndex++ + 1

              return { board_id: task.id, board_sequence_number, group_id: task.group_id }
            }
          }) as Partial<Board>[]
      ).filter(Boolean)

      if (updatedTasks?.length) {
        TaskService.editMultipleBoard(updatedTasks)
          .then(() => {
            // Tasks reordered within the same column have been updated
            loadTasks()
          })
          .catch(e => {
            e
          })
      }
    }
  }

  const handleAddTask = () => {
    const newTask: Partial<Board> = {
      priority: TaskPriority.Low,
      title: newTaskDialog.taskTitle,
      project_id: newTaskDialog.project?.id,
      group_id: newTaskDialog.group_id,
      board_sequence_number: newTaskDialog.board_sequence_number
    }

    TaskService.createBoard(newTask)
      .then(() => {
        loadTasks()
      })
      .catch(e => {
        e
      })
      .finally(() => {
        setNewTaskDialog({
          dialogIsActive: false
        })
      })
  }

  const handleAddTaskDialog = (group_id: number) => {
    setNewTaskDialog({
      dialogIsActive: true,
      taskTitle: '',
      group_id,
      board_sequence_number: 1
    })
  }

  const handleAddGroup = () => {
    if (groupDialog?.title?.trim() === '') return

    const newGroup: Partial<Group> = {
      title: groupDialog.title,
      description: groupDialog.description,
      label_id: groupDialog?.label?.id
    }

    TaskService.createGroup(newGroup)
      .then(() => {
        loadColumns()
      })
      .catch(e => {
        e
      })
      .finally(() => {
        setGroupDialog({
          addDialogIsActive: false
        })
      })
  }

  const handleNewGroupDialog = () => {
    setGroupDialog({
      addDialogIsActive: true,
      title: '',
      description: ''
    })
  }

  const handleDeleteGroupDialog = (group: Group) => {
    setGroupDialog({
      deleteDialogIsActive: true,
      title: group.title,
      group_id: group.id
    })
  }

  const handleEditGroupDialog = (group: Group) => {
    setGroupDialog({
      editDialogIsActive: true,
      title: group.title,
      group_id: group.id
    })
  }

  const handleCloseEditGroup = () => {
    setGroupDialog({
      editDialogIsActive: false
    })
  }

  const handleCloseDeleteGroup = () => {
    setGroupDialog({
      deleteDialogIsActive: false
    })
  }

  const handleDeleteGroup = () => {
    if (!groupDialog?.deleteDialogIsActive || !groupDialog?.group_id) return

    TaskService.deleteGroup(groupDialog.group_id)
      .then(() => {
        loadColumns()
      })
      .catch(e => {
        e
      })
      .finally(() => {
        setGroupDialog({
          deleteDialogIsActive: false
        })
      })
  }

  const handleEditGroup = () => {
    if (!groupDialog?.editDialogIsActive || !groupDialog?.group_id) return

    TaskService.editGroup(groupDialog.group_id, { title: groupDialog.title })
      .then(() => {
        loadColumns()
      })
      .catch(e => {
        e
      })
      .finally(() => {
        setGroupDialog({
          editDialogIsActive: false
        })
      })
  }

  const handleLabelSelect = (label: Label | null) => {
    if (!label) return

    setGroupDialog({ ...groupDialog, label })
  }

  const handleProjectSelect = (project: Project | null) => {
    if (!project) return

    setNewTaskDialog({ ...newTaskDialog, project })
  }

  if (!isLoaded) {
    return <div>درحال بارگذاری</div>
  }

  if (noData) {
    return <div></div>
  }

  return (
    <Box sx={{ height: '100%' }}>
      {tasks.length === 0 && columns.length === 0 && !groupDialog.addDialogIsActive && (
        <Empty
          message='شما هنوز هیچ گروه یا وظیفه ای داخل سیستم تعریف نکرده اید.'
          buttonText='ایجاد لیست جدید'
          buttonHandler={handleNewGroupDialog}
        />
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display='flex' flexDirection='row' justifyContent='start' sx={{ height: '100%' }}>
          {groupDialog.addDialogIsActive && (
            <Box sx={{ height: '100%' }}>
              <StackStyled
                sx={{
                  border: 1,
                  borderRadius: 2,
                  paddingLeft: 1,
                  paddingTop: 2,
                  margin: 2,
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ccc',
                  minHeight: 200,
                  height: 'calc(100vh - 100px)'
                }}
              >
                <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
                  <Box
                    sx={{
                      border: 1,
                      borderRadius: 2,
                      padding: 4,
                      marginRight: 1,
                      marginBottom: 3,
                      backgroundColor: '#fff',
                      borderColor: '#ccc'
                    }}
                  >
                    <TextField
                      autoFocus
                      fullWidth
                      label='عنوان'
                      sx={{ marginBottom: 4 }}
                      value={groupDialog.title}
                      onChange={e => setGroupDialog({ ...groupDialog, title: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label='توضیح'
                      sx={{ marginBottom: 4 }}
                      value={groupDialog.description}
                      onChange={e => setGroupDialog({ ...groupDialog, description: e.target.value })}
                    />
                    <Autocomplete
                      id='label_selector'
                      value={groupDialog.label}
                      getOptionLabel={label => `${label.title}`}
                      options={labels || []}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText={'هیچ آیتمی موجود نیست'}
                      renderOption={(props, label) => (
                        <Box component='li' {...props} key={label.id}>
                          <Chip
                            label={label.title}
                            style={{ backgroundColor: `${label.background_color}` }}
                            color='primary'
                          />
                        </Box>
                      )}
                      renderInput={params => <TextField {...params} label='برچسب' />}
                      onChange={(_, label) => handleLabelSelect(label)}
                      sx={{ marginBottom: 4 }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        justifyContent: 'space-around'
                      }}
                    >
                      <Button type='submit' variant='contained' onClick={handleAddGroup}>
                        افزودن
                      </Button>
                      <Button
                        type='submit'
                        variant='contained'
                        color='secondary'
                        onClick={() => setGroupDialog({ ...groupDialog, addDialogIsActive: false })}
                      >
                        انصراف
                      </Button>
                    </Box>
                  </Box>
                </form>
              </StackStyled>
            </Box>
          )}

          {columns.map(group => (
            <Box key={group.id} sx={{ height: '100%' }}>
              <Droppable droppableId={group.id.toString()}>
                {provided => (
                  <Box ref={provided.innerRef} {...provided.droppableProps}>
                    <StackStyled
                      sx={{
                        border: 1,
                        borderRadius: 2,
                        paddingLeft: 1,
                        margin: 2,
                        backgroundColor: '#f5f5f5',
                        borderColor: '#ccc',
                        minHeight: 200,
                        height: 'calc(100vh - 100px)'
                      }}
                    >
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                        spacing={2}
                        sx={{ marginY: 2, paddingX: 4 }}
                      >
                        {groupDialog.editDialogIsActive && groupDialog.group_id === group.id ? (
                          <TextField
                            autoFocus
                            fullWidth
                            label='عنوان'
                            value={groupDialog.title}
                            onChange={e => setGroupDialog({ ...groupDialog, title: e.target.value })}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButton color='info' size='small' onClick={() => handleEditGroup()}>
                                    <Send />
                                  </IconButton>
                                  <IconButton color='error' size='small' onClick={() => handleCloseEditGroup()}>
                                    <Close />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography>{group.title}</Typography>
                            <Chip
                              size='small'
                              label={group?.label?.title}
                              style={{ backgroundColor: `${group?.label?.background_color}` }}
                              sx={{ marginX: 4 }}
                            />
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {!editMode ? (
                            <IconButton
                              color='secondary'
                              size='small'
                              sx={{ marginX: 4 }}
                              onClick={() => handleAddTaskDialog(group.id)}
                            >
                              <Plus />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton color='secondary' size='small' onClick={() => handleEditGroupDialog(group)}>
                                <Pencil />
                              </IconButton>
                              <IconButton color='secondary' size='small' onClick={() => handleDeleteGroupDialog(group)}>
                                <Delete />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Stack>
                      {newTaskDialog?.dialogIsActive && newTaskDialog.group_id === group.id && (
                        <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
                          <Box
                            sx={{
                              border: 1,
                              borderRadius: 2,
                              padding: 4,
                              marginRight: 1,
                              marginBottom: 3,
                              backgroundColor: '#fff',
                              borderColor: '#ccc'
                            }}
                          >
                            <TextField
                              autoFocus
                              fullWidth
                              label='عنوان'
                              sx={{ marginBottom: 4 }}
                              value={newTaskDialog.taskTitle}
                              onChange={e => setNewTaskDialog({ ...newTaskDialog, taskTitle: e.target.value })}
                            />
                            <Autocomplete
                              id='project_selector'
                              value={newTaskDialog.project}
                              options={projects || []}
                              getOptionLabel={project => `${project.title}`}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              noOptionsText={'هیچ آیتمی موجود نیست'}
                              renderOption={(props, project) => (
                                <Box
                                  component='li'
                                  {...props}
                                  key={project.title}
                                  sx={{
                                    '&:nth-of-type(odd)': {
                                      backgroundColor: theme => theme.palette.divider
                                    }
                                  }}
                                >
                                  {project.title}
                                </Box>
                              )}
                              renderInput={params => <TextField {...params} label='گروه کاری' />}
                              onChange={(_, value) => handleProjectSelect(value)}
                              sx={{ marginBottom: 4 }}
                            />
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                justifyContent: 'space-around'
                              }}
                            >
                              <Button
                                type='submit'
                                variant='contained'
                                onClick={handleAddTask}
                                disabled={!newTaskDialog.taskTitle || !newTaskDialog.project}
                              >
                                افزودن
                              </Button>
                              <Button
                                type='submit'
                                variant='contained'
                                color='secondary'
                                onClick={() => setNewTaskDialog({ ...newTaskDialog, dialogIsActive: false })}
                              >
                                انصراف
                              </Button>
                            </Box>
                          </Box>
                        </form>
                      )}
                      <Box sx={{ overflowX: 'auto' }}>
                        {tasks
                          .sort((a: Board, b: Board) => a.board_sequence_number - b.board_sequence_number)
                          .map(task => {
                            if (task.group_id === group.id) {
                              return (
                                <Draggable
                                  key={task?.id}
                                  draggableId={task?.id?.toString() ?? ''}
                                  index={task.board_sequence_number}
                                >
                                  {provided => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        border: 1,
                                        borderRadius: 2,
                                        padding: 4,
                                        marginRight: 1,
                                        marginBottom: 3,
                                        backgroundColor: '#fff',
                                        borderColor: '#ccc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      <Link passHref href={`/tasks/board/view?id=${task?.id}`}>
                                        <LinkTitleStyled>{task?.title}</LinkTitleStyled>
                                      </Link>
                                      <Avatar
                                        alt={task?.assigned_to?.first_name}
                                        src={`${task?.assigned_to?.avatar}?width=120`}
                                        imgProps={{ crossOrigin: 'use-credentials' }}
                                        sx={{ width: '2rem', height: '2rem' }}
                                      />
                                    </Box>
                                  )}
                                </Draggable>
                              )
                            }
                          })}
                        {provided.placeholder}
                      </Box>
                    </StackStyled>
                  </Box>
                )}
              </Droppable>
            </Box>
          ))}
        </Box>
      </DragDropContext>
      <Dialog
        open={groupDialog?.deleteDialogIsActive || false}
        onClose={() => handleCloseDeleteGroup()}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle>تایید پاک کردن</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            <StyledDescreption>
              {`آیا از پاک کردن `}
              <span className='groupName'>لیست</span>
              {` `}
              <span className='name'>{groupDialog.title}</span>
              {` اطمینان دارید؟`}
            </StyledDescreption>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ mt: 4 }}>
          <Button autoFocus variant='outlined' fullWidth onClick={() => handleCloseDeleteGroup()}>
            خیر
          </Button>
          <Button variant='contained' color='error' fullWidth onClick={() => handleDeleteGroup()}>
            بله پاک شود
            <TrashCanOutline />
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
})

export default KanbanApp
