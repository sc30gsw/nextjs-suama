export class ClientServiceError extends Error {
  status = 500

  constructor(message: string = 'Client service error occurred') {
    super(message)
    this.name = 'ClientServiceError'
  }
}

export class ClientNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `Client with id ${id} not found` : 'Client not found')
    this.name = 'ClientNotFoundError'
  }
}
