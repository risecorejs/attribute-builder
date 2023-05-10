import { Model, ProjectionAlias, FindAttributeOptions } from 'sequelize'

import { IQuery } from '../interfaces'

export default function <M extends Model>(
  model: typeof Model & { new (): M },
  query: IQuery = {},
  additionalFields?: Record<string, any>
): Array<string | ProjectionAlias> {
  const attributeList = Object.keys(model.getAttributes())

  const attributes: FindAttributeOptions = []

  if (Array.isArray(query.fields) && query.fields.filter((item) => item).length) {
    query.fields = [...new Set(query.fields)]

    if (query.fields.every((item) => item.startsWith('-'))) {
      for (const attribute of attributeList) {
        if (!query.fields.includes('-' + attribute)) {
          attributes.push(attribute)
        }
      }
    } else {
      for (const field of query.fields) {
        if (attributeList.includes(field)) {
          attributes.push(field)
        }
      }
    }
  } else {
    for (const attribute of attributeList) {
      attributes.push(attribute)
    }
  }

  if (
    additionalFields &&
    Array.isArray(query.additionalFields) &&
    query.additionalFields.filter((item) => item).length
  ) {
    query.additionalFields = [...new Set(query.additionalFields)]

    for (const queryAdditionalField of query.additionalFields) {
      if (additionalFields.hasOwnProperty(queryAdditionalField)) {
        attributes.push([additionalFields[queryAdditionalField], queryAdditionalField])
      }
    }
  }

  return attributes
}
