// components/DynamicForm/utils/FieldGraph.js
export default class FieldGraph {
  constructor() {
    this.adjacencyList = new Map()
  }

  addDependency(from, to) {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, new Set())
    }
    this.adjacencyList.get(from).add(to)
  }

  getAffectedFields(field) {
    const affected = new Set()
    const queue = [field]

    while (queue.length > 0) {
      const current = queue.shift()
      const neighbors = this.adjacencyList.get(current)

      if (neighbors) {
        neighbors.forEach(neighbor => {
          if (!affected.has(neighbor)) {
            affected.add(neighbor)
            queue.push(neighbor)
          }
        })
      }
    }

    return Array.from(affected)
  }

  getSortedFields(fields) {
    // 拓扑排序
    const inDegree = new Map()
    const subGraph = new Map()

    fields.forEach(field => {
      inDegree.set(field, 0)
      subGraph.set(field, new Set())
    })

    fields.forEach(field => {
      const neighbors = this.adjacencyList.get(field)
      if (neighbors) {
        neighbors.forEach(neighbor => {
          if (fields.includes(neighbor)) {
            subGraph.get(field).add(neighbor)
            inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1)
          }
        })
      }
    })

    const queue = []
    const result = []

    inDegree.forEach((degree, field) => {
      if (degree === 0) {
        queue.push(field)
      }
    })

    while (queue.length > 0) {
      const current = queue.shift()
      result.push(current)

      const neighbors = subGraph.get(current)
      if (neighbors) {
        neighbors.forEach(neighbor => {
          const newDegree = (inDegree.get(neighbor) || 0) - 1
          inDegree.set(neighbor, newDegree)
          if (newDegree === 0) {
            queue.push(neighbor)
          }
        })
      }
    }

    return result
  }
}