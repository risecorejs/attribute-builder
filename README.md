# Документация пакета @risecorejs/attribute-builder

## Обзор

Пакет `@risecorejs/attribute-builder` предоставляет утилитарную функцию для создания списка атрибутов модели Sequelize на основе запроса. Она позволяет легко выбирать и исключать определенные поля при выполнении запросов к базе данных.

Главная функция из пакета, принимает три аргумента: модель Sequelize (наследник `Model`), объект запроса `query` и дополнительные поля `additionalFields`. Функция возвращает массив имен атрибутов или алиасов проекций, которые будут использоваться в запросе.

### Как это работает?

1. Функция начинается с получения списка имен атрибутов модели.
2. Затем она проверяет массив `query.fields`, если он передан, и на его основе формирует список атрибутов для выборки.
   - Если в массиве присутствуют атрибуты с префиксом `-`, то они будут исключены из выборки.
   - Если же префикса нет, то в выборку включаются только те атрибуты, которые указаны в массиве.
   - Если `query.fields` не передан, то в выборку будут включены все атрибуты модели. 
3. Далее функция проверяет наличие дополнительных полей `additionalFields` и массива `query.additionalFields`.
   - Если оба аргумента переданы, то для каждого поля из `query.additionalFields` добавляется соответствующий атрибут в список выборки. Значения атрибутов берутся из объекта `additionalFields`, ключи которого совпадают с именами атрибутов.
4. Наконец, функция возвращает список выбранных атрибутов. Если список пустой, то возвращается список всех атрибутов модели.

## Установка

Вы можете установить пакет `@risecorejs/attribute-builder` с помощью npm:

```shell
npm install @risecorejs/attribute-builder
```

## Использование

### Импорт пакета

Для использования пакета импортируйте его в свой проект:

```typescript
import attributeBuilder from '@risecorejs/attribute-builder'
```

### Сигнатура функции

Главная функция имеет следующую сигнатуру:

```typescript
attributeBuilder<M extends Model>(
  model: typeof Model & { new (): M },
  query: IQuery = {},
  additionalFields?: Record<string, any>
): Array<string | ProjectionAlias>
```

### Параметры

- `model`: Модель Sequelize, для которой выполняется запрос. Модель Sequelize (наследник `Model`).
- `query` (необязательный): Объект, представляющий параметры запроса.
  - `fields` (необязательный): Массив полей, которые следует включить в результат запроса.
  - `additionalFields` (необязательный): Массив дополнительных полей, которые следует включить в результат запроса.
- `additionalFields` (необязательный): Объект, содержащий дополнительные поля и их значения.

### Возвращаемое значение

Главная функция возвращает массив полей или псевдонимов проекций, основываясь на переданном запросе и модели. Если в запросе не указаны поля или псевдонимы, функция возвращает все атрибуты модели.

### Пример использования

#### Базовый пример

```typescript
// database/additional-fields/user.ts

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

import getUserAdditionalFields from '~/database/additional-fields/user.ts'

/**
 * INDEX
 * Getting all users
 * @param req {express.Request}
 * @param res {express.Response}
 */
export async function index(req: express.Request, res: express.Response) {
  // Вариант 1
  
  /**
   * Пример объекта запроса `req.query`
   * req.query = {
   *    fields: ['id', 'name', 'email'],
   *    additionalFields: ['subordinateCount'],
   *  }
   */

  const users = await models.User.findAll({
    attributes: attributeBuilder(models.User, req.query, getUserAdditionalFields()) // ['id', 'name', 'email', ['subordinateCount', sequelize.literal('(SELECT COUNT(*) FROM "user" AS "Subordinates"...]]
  })
  
  // ...
  
  // Вариант 2

  /**
   * Пример объекта запроса `req.query`
   * req.query = {
   *    fields: ['-createdAt', '-updatedAt', '-deletedAt']
   *  }
   */

  const users = await models.User.findAll({
    attributes: attributeBuilder(models.User, req.query, getUserAdditionalFields()) // ['id', 'name', 'email']
  })

  // ...
}
```

### Пример с использованием метода req.attributeBuilder

```typescript
// controllers/users.ts

import models from '@riscorejs/core/models'

import express from 'express'

import getUserAdditionalFields from '~/database/additional-fields/user.ts'

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
   *  }
   */

  const users = await models.User.findAll({
    attributes: req.attributeBuilder(models.User, getUserAdditionalFields()) // ['id', 'name', 'email', ['subordinateCount', sequelize.literal('(SELECT COUNT(*) FROM "user" AS "Subordinates"...]]
  })
  
  // ...
}
```