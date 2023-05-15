import * as sequelize from 'sequelize'

import * as interfaces from '../interfaces'
import * as exceptions from './exceptions'

export default function (
  model: any,
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

  let queryFields: undefined | Array<string> =
    query[options.prefixQueryKeys ? options.prefixQueryKeys + 'Fields' : 'fields']

  let queryAdditionalFields: undefined | Array<string> =
    query[options.prefixQueryKeys ? options.prefixQueryKeys + 'AdditionalFields' : 'additionalFields']

  if (Array.isArray(queryFields) && (queryFields = queryFields.filter((item) => item)).length) {
    queryFields = [...new Set(queryFields.map((item) => item.trim()))]

    const invalidFields: Array<string> = []

    for (const field of queryFields) {
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

    if (queryFields.every((item) => item.startsWith('-'))) {
      for (const attribute of attributeList) {
        if (queryFields.includes('-' + attribute)) {
          continue
        }

        attributes.push(attribute)
      }
    } else {
      for (const field of queryFields) {
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
    Array.isArray(queryAdditionalFields) &&
    (queryAdditionalFields = queryAdditionalFields.filter((item) => item)).length
  ) {
    queryAdditionalFields = [...new Set(queryAdditionalFields.map((item) => item.trim()))]

    const invalidAdditionalFields: Array<string> = []

    for (const additionalField of queryAdditionalFields) {
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

    for (const additionalField of queryAdditionalFields) {
      if (options.additionalAttributes.hasOwnProperty(additionalField)) {
        attributes.push([options.additionalAttributes[additionalField], additionalField])
      }
    }
  }

  return attributes
}
