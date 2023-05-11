import * as sequelize from 'sequelize'

import * as interfaces from '../interfaces'
import * as exceptions from './exceptions'

export default function <M extends sequelize.Model>(
  model: typeof sequelize.Model & { new (): M },
  query: interfaces.IQuery = {},
  options: interfaces.IOptions = {}
): Array<string | sequelize.ProjectionAlias> {
  const attributeList: Array<string> = []

  const rawAttributes = model.getAttributes()

  for (const attribute in rawAttributes) {
    if (rawAttributes.hasOwnProperty(attribute)) {
      if (options.excludeAttributes && options.excludeAttributes.includes(attribute)) {
        continue
      }

      attributeList.push(attribute)
    }
  }

  const attributes: sequelize.FindAttributeOptions = []

  if (Array.isArray(query.fields) && (query.fields = query.fields.filter((item) => item)).length) {
    query.fields = [...new Set(query.fields.map((item) => item.trim()))]

    const invalidFields: Array<string> = []

    for (const field of query.fields) {
      if (!attributeList.includes(field.startsWith('-') ? field.slice(1) : field)) {
        invalidFields.push(field)
      }
    }

    if (invalidFields.length) {
      throw new exceptions.ExtendedError("The fields you passed don't match the attributes of the model", {
        errorCode: 'invalid_query_fields',
        invalidFields,
        availableFields: attributeList
      })
    }

    if (query.fields.every((item) => item.startsWith('-'))) {
      for (const attribute of attributeList) {
        if (query.fields.includes('-' + attribute)) {
          continue
        }

        attributes.push(attribute)
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
    options.additionalAttributes &&
    Array.isArray(query.additionalFields) &&
    (query.additionalFields = query.additionalFields.filter((item) => item)).length
  ) {
    query.additionalFields = [...new Set(query.additionalFields.map((item) => item.trim()))]

    const invalidAdditionalFields: Array<string> = []

    for (const additionalField of query.additionalFields) {
      if (!options.additionalAttributes.hasOwnProperty(additionalField)) {
        invalidAdditionalFields.push(additionalField)
      }
    }

    if (invalidAdditionalFields.length) {
      throw new exceptions.ExtendedError(
        "The additional fields you passed in do not match the model's additional attributes.",
        {
          errorCode: 'invalid_query_additional_fields',
          invalidAdditionalFields,
          availableAdditionalFields: Object.keys(options.additionalAttributes)
        }
      )
    }

    for (const additionalField of query.additionalFields) {
      if (options.additionalAttributes.hasOwnProperty(additionalField)) {
        attributes.push([options.additionalAttributes[additionalField], additionalField])
      }
    }
  }

  return attributes
}
