import express from 'express'
import * as sequelize from 'sequelize'

import * as interfaces from '../interfaces'

import attributeBuilder from './index'

export default function (req: express.Request, res: express.Response, next: express.NextFunction) {
  req.attributeBuilder = function (
    model: any,
    options?: interfaces.IOptions
  ): Array<string | sequelize.ProjectionAlias> {
    return attributeBuilder(model, req.query, options)
  }

  next()
}
