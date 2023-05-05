/**
 * Represents a query object containing fields and additional fields arrays.
 */
export interface IQuery {
  /**
   * An optional array of fields to include in the query result.
   */
  fields?: Array<string>

  /**
   * An optional array of additional fields to include in the query result.
   */
  additionalFields?: Array<string>
}
