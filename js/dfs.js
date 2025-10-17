function DFSSolver(grid, screen) {
  var stack = [];
  var visited = new Int8Array(grid.cells.length);
  var path = [];

  var startNode = {
    x: Math.floor(grid.width / 2),
    y: Math.floor(grid.height / 2),
  };
  var endNode = grid.exit;

  var currentNode = startNode;
  stack.push(currentNode);
  visited[currentNode.y + currentNode.x * grid.width] = 1;

  this.step = function () {
    if (stack.length === 0) {
      return "done"; // No path found
    }

    currentNode = stack.pop();
    path.push(currentNode);

    // Draw current path
    screen.printCellState(currentNode, "#3677b2"); // Visiting color

    if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
      return "found"; // Path found
    }

    var neighbors = getNeighbors(currentNode);
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      var index = neighbor.y + neighbor.x * grid.width;
      if (!visited[index] && !grid.isWall(index)) {
        visited[index] = 1;
        stack.push(neighbor);
      }
    }

    return "exploring";
  };

  function getNeighbors(node) {
    var neighbors = [];
    var x = node.x;
    var y = node.y;

    if (x > 0) neighbors.push({ x: x - 1, y: y });
    if (x < grid.width - 1) neighbors.push({ x: x + 1, y: y });
    if (y > 0) neighbors.push({ x: x, y: y - 1 });
    if (y < grid.height - 1) neighbors.push({ x: x, y: y + 1 });

    return neighbors;
  }
}
