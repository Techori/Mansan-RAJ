function tallyRoundOff(amount) {
    const rounded = Math.round(amount);  // Round to nearest 1
    const roundOff = +(rounded - amount).toFixed(2); // e.g. 0.87 or -0.13
  
    return {
      roundedTotal: rounded.toFixed(2),              // Final payable value
      roundOffAmount: Math.abs(roundOff).toFixed(2), // Always positive
      isNegative: roundOff < 0                       // If round-off needs to reduce amount
    };
  }
  
  function parseUnitHierarchy(hierarchyStr) {
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
  
  function buildConversionMap(hierarchyStr) {
    const relations = parseUnitHierarchy(hierarchyStr);
  
    const graph = {};
  
    for (const { from, to, multiplier } of relations) {
      if (!graph[from]) graph[from] = {};
      if (!graph[to]) graph[to] = {};
      graph[from][to] = multiplier;
      graph[to][from] = 1 / multiplier;
    }
    return graph;
  }
  
  function findConversionPath(graph, from, to, visited = new Set()) {
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
  
  function convert(value, fromUnit, toUnit, hierarchyStr) {
    const graph = buildConversionMap(hierarchyStr);
    const path = findConversionPath(graph, fromUnit, toUnit);
  
    if (!path) {
      throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
    }
  
    let result = value;
    for (let i = 0; i < path.length - 1; i++) {
      result *= path[i].factor;
    }
  
    return result;
  }
  // const hierarchy = "case of 150 pcs";
  
  // console.log(convert(2, 'pcs', 'case', hierarchy));
  // console.log(convert(1, 'case', 'pcs', hierarchy));     // → 240
  // console.log(convert(2, 'pcs', 'case', hierarchy));     // → 0.00833
  // console.log(convert(1, 'box', 'mala', hierarchy));     // → 75
  // console.log(convert(10, 'mala', 'case', hierarchy));   // → 0.00556
  
  export {tallyRoundOff,convert};