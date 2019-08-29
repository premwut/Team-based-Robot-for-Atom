import R from "ramda"

export const isPagination = (req) => {
  const { page, limit: pageSize } = req.query
  return page !== undefined && pageSize !== undefined && page.length && pageSize.length
}

export const getPagination = (collection) => {
  const { pagination } = collection
  if (pagination) {
    const { page, pageSize: limit, rowCount: total } = pagination
    return { page, limit, total }
  } else {
    return {}
  }
}

export const renameKeys = R.curry((keysMap, obj) =>
  R.reduce((acc, key) => R.assoc(keysMap[key] || key, obj[key], acc), {}, R.keys(obj))
)

export const swapValToKeys = R.curry(obj =>
  R.reduce((acc, key) => R.assoc(obj[key], key, acc), {}, R.keys(obj))
)
