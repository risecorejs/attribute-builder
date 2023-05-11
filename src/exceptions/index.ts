export class ExtendedError extends Error {
  [key: string]: any

  constructor(message: string, options?: Record<string, any>) {
    super(message)

    if (options) {
      for (const key in options) {
        if (options.hasOwnProperty(key)) {
          this[key] = options[key]
        }
      }
    }
  }
}
