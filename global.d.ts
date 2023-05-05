import { Model, ProjectionAlias } from 'sequelize'

declare global {
  namespace Express {
    interface Request {
      attributeBuilder: <M extends Model>(
        model: typeof Model & { new (): M },
        additionalFields?: Record<string, any>
      ) => Array<string | ProjectionAlias>
    }
  }
}
