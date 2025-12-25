export class MissionServiceError extends Error {
  status = 500

  constructor(message: string = 'Mission service error occurred') {
    super(message)
    this.name = 'MissionServiceError'
  }
}

export class MissionNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `Mission with id ${id} not found` : 'Mission not found')
    this.name = 'MissionNotFoundError'
  }
}
