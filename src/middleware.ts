import { Request, Response, NextFunction } from 'express'
import { Model, ProjectionAlias } from 'sequelize'

import attributeBuilder from './index'

export default function (req: Request, res: Response, next: NextFunction) {
  req.attributeBuilder = function <M extends Model>(
    model: typeof Model & { new (): M },
    additionalFields?: Record<string, any>
  ): Array<string | ProjectionAlias> {
    return attributeBuilder(model, req.query, additionalFields)
  }

  next()
}
