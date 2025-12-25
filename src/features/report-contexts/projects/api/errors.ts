export class ProjectServiceError extends Error {
  status = 500

  constructor(message: string = 'Project service error occurred') {
    super(message)
    this.name = 'ProjectServiceError'
  }
}

export class ProjectNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `Project with id ${id} not found` : 'Project not found')
    this.name = 'ProjectNotFoundError'
  }
}
