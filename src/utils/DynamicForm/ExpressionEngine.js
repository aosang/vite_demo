// components/DynamicForm/utils/ExpressionEngine.js
export default class ExpressionEngine {
  evaluate(expression, values) {
    if (expression.$and) {
      return expression.$and.every(expr => this.evaluate(expr, values))
    }

    if (expression.$or) {
      return expression.$or.some(expr => this.evaluate(expr, values))
    }

    if (expression.$not) {
      return !this.evaluate(expression.$not, values)
    }

    if (expression.$eq) {
      const [field, expectedValue] = expression.$eq
      return values[field] === expectedValue
    }

    if (expression.$ne) {
      const [field, expectedValue] = expression.$ne
      return values[field] !== expectedValue
    }

    if (expression.$gt) {
      const [field, threshold] = expression.$gt
      return (values[field] || 0) > threshold
    }

    if (expression.$gte) {
      const [field, threshold] = expression.$gte
      return (values[field] || 0) >= threshold
    }

    if (expression.$lt) {
      const [field, threshold] = expression.$lt
      return (values[field] || 0) < threshold
    }

    if (expression.$lte) {
      const [field, threshold] = expression.$lte
      return (values[field] || 0) <= threshold
    }

    if (expression.$in) {
      const [field, valueList] = expression.$in
      return valueList.includes(values[field])
    }

    if (expression.$nin) {
      const [field, valueList] = expression.$nin
      return !valueList.includes(values[field])
    }

    return true
  }
}