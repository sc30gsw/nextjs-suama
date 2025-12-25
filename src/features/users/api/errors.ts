export class UserServiceError extends Error {
  status = 500

  constructor(message: string = 'User service error occurred') {
    super(message)
    this.name = 'UserServiceError'
  }
}

export class UserNotFoundError extends Error {
  status = 404

  constructor(id?: string) {
    super(id ? `User with id ${id} not found` : 'User not found')
    this.name = 'UserNotFoundError'
  }
}
