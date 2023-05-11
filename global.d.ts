import * as sequelize from 'sequelize'

import * as interfaces from './interfaces'

declare global {
  namespace Express {
    interface Request {
      attributeBuilder: <M extends sequelize.Model>(
        model: typeof sequelize.Model & { new (): M },
        options?: interfaces.IOptions
      ) => Array<string | sequelize.ProjectionAlias>
    }
  }
}
