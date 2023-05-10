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
    const excludedFields = query.fields.filter((item) => {
      return item.startsWith('-')
    })

    if (query.fields.length === excludedFields.length) {
      for (const attribute of attributeList) {
        if (!excludedFields.find((excludeField) => excludeField.includes(attribute))) {
          attributes.push(attribute)
        }
      }
    } else {
      const setQueryFields = new Set(query.fields)

      for (const attribute of attributeList) {
        if (setQueryFields.has(attribute)) {
          attributes.push(attribute)
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
    for (const queryAdditionalField of query.additionalFields) {
      if (additionalFields.hasOwnProperty(queryAdditionalField)) {
        attributes.push([additionalFields[queryAdditionalField], queryAdditionalField])
      }
    }
  }

  return attributes
}
