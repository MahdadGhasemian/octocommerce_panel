import api from './api'

export type UploadFileResponse = {
  fileName: string
  size: number
  url: string
  description: boolean
}

class StorageService {
  uploadFile(file: File): Promise<UploadFileResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/storage/public-files', formData).then(response => {
      return response?.data
    })
  }

  uploadFileWithUrl(target_url: string): Promise<UploadFileResponse> {
    return api.post('/storage/public-files/external-url/upload', { target_url }).then(response => {
      return response?.data
    })
  }

  accessUploadFile(file: File): Promise<UploadFileResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/storage/private-files', formData).then(response => {
      return response?.data
    })
  }
}

export default new StorageService()
