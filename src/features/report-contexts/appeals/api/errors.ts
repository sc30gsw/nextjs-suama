export class AppealServiceError extends Error {
  status = 500

  constructor(message: string = 'Appeal service error occurred') {
    super(message)
    this.name = 'AppealServiceError'
  }
}

export class AppealNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `Appeal with id ${id} not found` : 'Appeal not found')
    this.name = 'AppealNotFoundError'
  }
}
