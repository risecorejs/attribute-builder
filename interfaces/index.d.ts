export interface IQuery {
  fields?: Array<string>
  additionalFields?: Array<string>
}

export interface IOptions {
  setPrefixQueryKeys?: string
  additionalAttributes?: Record<string, any>
  excludeAttributes?: Array<string>
}
