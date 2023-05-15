import * as sequelize from 'sequelize'

import * as interfaces from './interfaces'

declare global {
  namespace Express {
    interface Request {
      attributeBuilder: (model: any, options?: interfaces.IOptions) => Array<string | sequelize.ProjectionAlias>
    }
  }
}
