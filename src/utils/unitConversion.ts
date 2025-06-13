function parseUnitHierarchy(hierarchyStr: string) {
  const tokens = hierarchyStr.split(' of ').map(s => s.trim());
  const relations = [];

  for (let i = 0; i < tokens.length - 1; i++) {
    const [multiplierStr, unitTo] = tokens[i + 1].split(' ');
    const unitFrom = tokens[i].split(' ').pop();
    const multiplier = parseFloat(multiplierStr);
    relations.push({ from: unitFrom, to: unitTo, multiplier });
  }

  return relations;
}

function buildConversionMap(hierarchyStr: string) {
  const relations = parseUnitHierarchy(hierarchyStr);
  const graph: Record<string, Record<string, number>> = {};

  for (const { from, to, multiplier } of relations) {
    if (!graph[from]) graph[from] = {};
    if (!graph[to]) graph[to] = {};
    graph[from][to] = multiplier;
    graph[to][from] = 1 / multiplier;
  }
  return graph;
}

function findConversionPath(graph: Record<string, Record<string, number>>, from: string, to: string, visited = new Set<string>()): { unit: string; factor: number }[] | null {
  if (from === to) return [{ unit: from, factor: 1 }];
  visited.add(from);

  for (const neighbor in graph[from] || {}) {
    if (!visited.has(neighbor)) {
      const path = findConversionPath(graph, neighbor, to, visited);
      if (path) {
        return [{ unit: from, factor: graph[from][neighbor] }, ...path];
      }
    }
  }

  return null;
}

export function convert(value: number, fromUnit: string, toUnit: string, hierarchyStr: string): number {
  const graph = buildConversionMap(hierarchyStr);
  const path = findConversionPath(graph, fromUnit, toUnit);

  if (!path) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }

  let result = value;
  for (let i = 0; i < path.length - 1; i++) {
    // For price conversion, divide by the factor instead of multiplying
    result /= path[i].factor;
  }

  return result;
}