# Документация пакета @risecorejs/attribute-builder

## Обзор

Пакет `@risecorejs/attribute-builder` предоставляет утилитарную функцию для создания списка атрибутов модели Sequelize на основе запроса. Она позволяет легко выбирать и исключать определенные поля при выполнении запросов к базе данных.

Главная функция из пакета, принимает три аргумента: модель Sequelize (наследник `Model`), объект запроса `query` и дополнительные опции `options`. Функция возвращает массив имен атрибутов или алиасов проекций, которые будут использоваться в запросе.

## Установка

Вы можете установить пакет `@risecorejs/attribute-builder` с помощью npm:

```shell
npm install @risecorejs/attribute-builder
```

## Использование

Для использования пакета импортируйте его в свой проект:

```typescript
import attributeBuilder from '@risecorejs/attribute-builder'
```

## Параметры

- `model`: Модель Sequelize (наследник `Model`), для которой выполняется запрос.
- `query` (необязательный): Объект (`object`), представляющий параметры запроса.
  - `fields` (необязательный): Массив полей (`Array<string>`), которые следует включить или исключить используя знак `-` из результата.
  - `additionalFields` (необязательный): Массив дополнительных полей (`Array<string>`), которые следует включить в результат запроса.
- `options` (необязательный): Объект (`object`), содержащий дополнительные опции.
  - `prefixQueryKeys` (необязательный): Префикс ключей запроса (`string`), меняет поведения поиска ключей `query.fields` и `query.additionalFields`. Например: `options.prefixQueryKeys = 'region'` в таком случае, функция будет искать `query.regionFields` и `query.regionAdditionalFields`.
  - `additionalAttributes` (необязательный): Объект (`object`), содержащий дополнительные атрибуты.
  - `excludeAttributes` (необязательный): Массив атрибутов (`Array<string>`) модели которые нужно исключить.

## Возвращаемое значение

Главная функция возвращает массив полей или псевдонимов проекций, основываясь на переданном запросе и модели. Если в запросе не указаны поля или псевдонимы, функция возвращает все атрибуты модели.

## Примеры использования

```typescript
// database/additional-attributes/user.ts

import sequelize from 'sequelize'

export default function() {
  return {
    subordinateCount: sequelize.literal('(SELECT COUNT(*) FROM "user" AS "Subordinates" WHERE "Subordinates"."supervisorId" = "User"."id")')
  }
}
```

```typescript
// controllers/users.ts

import models from '@riscorejs/core/models'
import attributeBuilder from '@risecorejs/attribute-builder'

import express from 'express'

import getUserAdditionalAttributes from '~/database/additional-attributes/user'

/**
 * INDEX
 * Getting all users
 * @param req {express.Request}
 * @param res {express.Response}
 */
export async function index(req: express.Request, res: express.Response) {
```

### Вариант 1

```typescript
  /**
   * Пример объекта запроса `req.query`
   * req.query = {
   *    fields: ['id', 'name', 'email'],
   *    additionalFields: ['subordinateCount']
   * }
   */

  /**
   * Все атрибуты модели `User`:
   * ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt', 'deletedAt']
   */
  const users = await models.User.findAll({
    attributes: attributeBuilder(models.User, req.query, {
      excludeAttributes: ['password'],
      additionalAttributes: getUserAdditionalAttributes()
    })
  })

  /**
   * Результирущий набор атрибутов модели `User`:
   * ['id', 'name', 'email', [sequelize.literal('(SELECT COUNT(*) FROM "user" AS "Subordinates"..., 'subordinateCount']]
   */

  // ...
```

### Вариант 2

```typescript
  /**
   * Пример объекта запроса `req.query`
   * req.query = {
   *    fields: ['-updatedAt', '-deletedAt'],
   *    cityFields: ['id', 'name']
   *  }
   */

  /**
   * Все атрибуты модели `User`:
   * ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt', 'deletedAt']
   */
  const users = await models.User.findAll({
    attributes: attributeBuilder(models.User, req.query, {
      excludeAttributes: ['password'],
      additionalAttributes: getUserAdditionalAttributes(),
    }),
    include: [
      {
        /**
         * Все атрибуты модели `City`:
         * ['id', 'name', 'regionId', 'createdAt', 'updatedAt', 'deletedAt']
         */
        model: models.City,
        as: 'city',
        attributes: attributeBuilder(models.City, req.query, {
          prefixQueryKeys: 'city'
        })
      }
    ]
  })

  /**
   * Результирущий набор атрибутов модели `User`:
   * ['id', 'name', 'email', 'createdAt']
   */

  /**
   * Результирущий набор атрибутов модели `City`:
   * ['id', 'name']
   */

  // ...
}
```

### Пример с использованием метода `req.attributeBuilder()`

Перед тем как использовать данный подход, сделайте следующие доработки в вашем проекте:

```typescript
// Импортируйте промежуточное ПО
import attributeBuilderMiddleware from '@risecorejs/attribute-builder/middleware'

// Добавьте промежуточное ПО в ваше приложение Express
app.use(attributeBuilderMiddleware)
```

Добавьте в ваш `tsconfig.json`, в поле `"types": []` следующий фрагмент:

```json
{
  "types": [
    "./node_modules/@risecorejs/attribute-builder/global"
  ]
}
```

**Использование:**

```typescript
// controllers/users.ts

import models from '@riscorejs/core/models'

import express from 'express'

import getUserAdditionalAttributes from '~/database/additional-attributes/user'

/**
 * INDEX
 * Getting all users
 * @param req {express.Request}
 * @param res {express.Response}
 */
export async function index(req: express.Request, res: express.Response) {
  /**
   * Пример объекта запроса `req.query`
   * req.query = {
   *    fields: ['id', 'name', 'email'],
   *    additionalFields: ['subordinateCount'],
   *    cityFields: ['id', 'name']
   *  }
   */

  /**
   * Все атрибуты модели `User`:
   * ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt', 'deletedAt']
   */
  const users = await models.User.findAll({
    attributes: req.attributeBuilder(models.User, {
      excludeAttributes: ['password'],
      additionalAttributes: getUserAdditionalAttributes()
    }),
    include: [
      {
        /**
         * Все атрибуты модели `City`:
         * ['id', 'name', 'regionId', 'createdAt', 'updatedAt', 'deletedAt']
         */
        model: models.City,
        as: 'city',
        attributes: req.attributeBuilder(models.City, {
          prefixQueryKeys: 'city'
        })
      }
    ]
  })

  /**
   * Результирущий набор атрибутов модели `User`:
   * ['id', 'name', 'email', [sequelize.literal('(SELECT COUNT(*) FROM "user" AS "Subordinates"...], 'subordinateCount']
   */

  /**
   * Результирущий набор атрибутов модели `City`:
   * ['id', 'name']
   */
  
  // ...
}
```