import api, { ApiListResponse } from './api'
import { User } from './auth.service'
import { createParams, InputColumnFiltersModel, InputSortingModel } from './param'

export type Label = {
  id: number
  title: string
  description: string
  background_color: string
  created_at: Date
  updated_at: Date
}

export type Project = {
  id: number
  title: string
  description?: string
  users?: User[]
  owned_by?: User
  created_at?: Date
  updated_at?: Date
}

export type Group = {
  id: number
  title: string
  description: string
  sequence_number: number
  label_id: number
  label: Label
  created_at: Date
  updated_at: Date
}

export type Content = {
  id: number
  content_type: ContentType
  content: string
  content_follow: string
  group?: Group
  created_by: User
}

export type Comment = {
  id: number
  comment_type: CommentType
  content: Content
  created_by: User
  board: Board
  created_at: Date
  updated_at: Date
}

export type Board = {
  id: number
  priority: TaskPriority
  title: string
  description: string
  board_sequence_number: number
  project_id: number
  project: Project
  group_id: number
  group: Group
  comments: Comment[]
  created_by_account_id: number
  created_by: User
  assigned_to_account_id: number
  assigned_to: User
  flow_users: User[]
  created_at: Date
  updated_at: Date
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export enum CommentType {
  Activity = 'activity',
  Comment = 'comment'
}

export enum ContentType {
  UserComment = 'user_comment',
  NewGroup = 'new_group',
  ChangeUserAssign = 'change_user_assign',
  ChangeGeneralData = 'change_general_data'
}

class TaskService {
  // Board
  getAllBoard(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Board>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/task/boards', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createBoard(board: Partial<Board>): Promise<Board> {
    return api.post('/task/boards', board).then(response => {
      return response?.data
    })
  }

  getBoard(id: number): Promise<Board> {
    return api.get(`/task/boards/${id}`).then(response => {
      return response?.data
    })
  }

  editBoard(id: number, board: Partial<Board>): Promise<Board> {
    return api.patch(`/task/boards/${id}`, board).then(response => {
      return response?.data
    })
  }

  deleteBoard(id: number): Promise<unknown> {
    return api.delete(`/task/boards/${id}`).then(response => {
      return response?.data
    })
  }

  getAllFlowListBoard(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Board>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/task/boards/flow/list', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  editMultipleBoard(boards: Array<Partial<Board>>): Promise<boolean> {
    return api.patch('/task/boards/multiple/sequence', { data: boards }).then(response => {
      return response?.data
    })
  }

  createComment(board_id: number, data: { content: string; content_follow: string }): Promise<Comment> {
    return api.post(`/task/boards/${board_id}/comment`, data).then(response => {
      return response?.data
    })
  }

  // Label
  getAllLabel(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Label>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/task/labels', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createLabel(label: Partial<Label>): Promise<Label> {
    return api.post('/task/labels', label).then(response => {
      return response?.data
    })
  }

  getLabel(id: number): Promise<Label> {
    return api.get(`/task/labels/${id}`).then(response => {
      return response?.data
    })
  }

  editLabel(id: number, label: Partial<Label>): Promise<Label> {
    return api.patch(`/task/labels/${id}`, label).then(response => {
      return response?.data
    })
  }

  deleteLabel(id: number): Promise<unknown> {
    return api.delete(`/task/labels/${id}`).then(response => {
      return response?.data
    })
  }

  // Group
  getAllGroup(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Group>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/task/groups', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createGroup(group: Partial<Group>): Promise<Group> {
    return api.post('/task/groups', group).then(response => {
      return response?.data
    })
  }

  getGroup(id: number): Promise<Group> {
    return api.get(`/task/groups/${id}`).then(response => {
      return response?.data
    })
  }

  editGroup(id: number, group: Partial<Group>): Promise<Group> {
    return api.patch(`/task/groups/${id}`, group).then(response => {
      return response?.data
    })
  }

  deleteGroup(id: number): Promise<unknown> {
    return api.delete(`/task/groups/${id}`).then(response => {
      return response?.data
    })
  }

  // Project
  getAllProject(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Project>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/task/projects', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createProject(project: Partial<Project>): Promise<Project> {
    return api.post('/task/projects', project).then(response => {
      return response?.data
    })
  }

  getProject(id: number): Promise<Project> {
    return api.get(`/task/projects/${id}`).then(response => {
      return response?.data
    })
  }

  editProject(id: number, project: Partial<Project>): Promise<Project> {
    return api.patch(`/task/projects/${id}`, project).then(response => {
      return response?.data
    })
  }

  deleteProject(id: number): Promise<unknown> {
    return api.delete(`/task/projects/${id}`).then(response => {
      return response?.data
    })
  }
}

export default new TaskService()
