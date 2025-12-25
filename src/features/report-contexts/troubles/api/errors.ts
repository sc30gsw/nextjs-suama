export class TroubleServiceError extends Error {
  status = 500

  constructor(message: string = 'Trouble service error occurred') {
    super(message)
    this.name = 'TroubleServiceError'
  }
}

export class TroubleNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `Trouble with id ${id} not found` : 'Trouble not found')
    this.name = 'TroubleNotFoundError'
  }
}
