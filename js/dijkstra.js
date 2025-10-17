function DijkstraSolver(grid, screen) {
  // Simple Priority Queue implementation
  function PriorityQueue() {
    this.elements = [];
  }

  PriorityQueue.prototype.enqueue = function (element, priority) {
    this.elements.push({ element: element, priority: priority });
    this.sort();
  };

  PriorityQueue.prototype.dequeue = function () {
    return this.elements.shift().element;
  };

  PriorityQueue.prototype.isEmpty = function () {
    return this.elements.length === 0;
  };

  PriorityQueue.prototype.sort = function () {
    this.elements.sort((a, b) => a.priority - b.priority);
  };

  var pq = new PriorityQueue();
  var distances = new Array(grid.cells.length).fill(Infinity);
  var previous = new Array(grid.cells.length).fill(null);
  var path = [];

  var startNode = {
    x: Math.floor(grid.width / 2),
    y: Math.floor(grid.height / 2),
  };
  var endNode = grid.exit;

  var startIndex = startNode.y + startNode.x * grid.width;
  distances[startIndex] = 0;

  pq.enqueue(startNode, 0);

  this.step = function () {
    if (pq.isEmpty()) {
      return "done"; // No path found
    }

    var currentNode = pq.dequeue();
    var currentIndex = currentNode.y + currentNode.x * grid.width;

    // Draw exploring
    screen.printCellState(currentNode, "#f83737"); // Visiting color

    if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
      // Reconstruct path
      var tempNode = currentNode;
      while (tempNode) {
        path.unshift(tempNode);
        var tempIndex = tempNode.y + tempNode.x * grid.width;
        tempNode = previous[tempIndex];
      }

      for (var i = 0; i < path.length; i++) {
        screen.printCellState(path[i], "#3677b2"); // Path color
      }

      return "found"; // Path found
    }

    var neighbors = getNeighbors(currentNode);
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      var neighborIndex = neighbor.y + neighbor.x * grid.width;

      if (!grid.isWall(neighborIndex)) {
        var newDist = distances[currentIndex] + 1; // Assume weight of 1

        if (newDist < distances[neighborIndex]) {
          distances[neighborIndex] = newDist;
          previous[neighborIndex] = currentNode;
          pq.enqueue(neighbor, newDist);
        }
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
