export interface IQuery {
  [key: string]: any

  fields?: Array<string>
  additionalFields?: Array<string>
}

export interface IOptions {
  prefixQueryKeys?: string
  additionalAttributes?: Record<string, any>
  excludeAttributes?: Array<string>
}
