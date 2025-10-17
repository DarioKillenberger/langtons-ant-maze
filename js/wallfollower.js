function WallFollowerSolver(grid, screen) {
  // Direction vectors: 0:right, 1:down, 2:left, 3:up
  var dx = [1, 0, -1, 0];
  var dy = [0, 1, 0, -1];

  var visited = new Int8Array(grid.cells.length);
  var path = [];

  var startNode = {
    x: Math.floor(grid.width / 2),
    y: Math.floor(grid.height / 2),
  };

  var currentPosition = {
    x: startNode.x,
    y: startNode.y,
  };
  var direction = 0; // Start facing right
  var foundWall = false;

  // Mark start as visited
  visited[currentPosition.y + currentPosition.x * grid.width] = 1;
  path.push(currentPosition);

  // Check if position is at the edge of the maze (exit)
  function isAtEdge(pos) {
    return (
      pos.x === 0 ||
      pos.x === grid.width - 1 ||
      pos.y === 0 ||
      pos.y === grid.height - 1
    );
  }

  this.step = function () {
    if (isAtEdge(currentPosition)) {
      screen.printCellState(currentPosition, "#3677b2"); // Draw final step
      return "found";
    }

    screen.printCellState(currentPosition, "#3677b2");

    // --- Phase 1: Find a wall ---
    if (!foundWall) {
      // Check if there is a wall adjacent to the current position
      for (let i = 0; i < 4; i++) {
        const checkX = currentPosition.x + dx[i];
        const checkY = currentPosition.y + dy[i];
        if (
          checkX >= 0 &&
          checkX < grid.width &&
          checkY >= 0 &&
          checkY < grid.height &&
          grid.isWall(checkY + checkX * grid.width)
        ) {
          foundWall = true;
          // Orient ourselves so the newly found wall is on our right
          // If wall is at direction i, we should face direction (i + 3) % 4 to have wall on right
          direction = (i + 3) % 4;
          // Wall is found, so we proceed to Phase 2 in the same step
          break;
        }
      }

      // If no wall is adjacent yet, move in a straight line until we find one.
      if (!foundWall) {
        let nextX = currentPosition.x + dx[direction];
        let nextY = currentPosition.y + dy[direction];

        // If we are about to hit the edge of the grid, turn right to continue searching.
        if (
          nextX < 0 ||
          nextX >= grid.width ||
          nextY < 0 ||
          nextY >= grid.height
        ) {
          direction = (direction + 1) % 4; // turn right
        } else {
          currentPosition.x = nextX;
          currentPosition.y = nextY;
        }
        path.push({ x: currentPosition.x, y: currentPosition.y });
        visited[currentPosition.y + currentPosition.x * grid.width] = 1;
        return "exploring";
      }
    }

    // --- Phase 2: Follow the wall (Right-Hand Rule) ---
    // Check cell to the right of current direction
    const rightDir = (direction + 1) % 4;
    const rightX = currentPosition.x + dx[rightDir];
    const rightY = currentPosition.y + dy[rightDir];
    const isWallToRight =
      rightX < 0 ||
      rightX >= grid.width ||
      rightY < 0 ||
      rightY >= grid.height ||
      grid.isWall(rightY + rightX * grid.width);

    if (!isWallToRight) {
      // Rule 1: No wall to the right. Turn right and move one step.
      direction = rightDir;
      currentPosition.x += dx[direction];
      currentPosition.y += dy[direction];
    } else {
      // Wall is to our right. Check ahead.
      const forwardX = currentPosition.x + dx[direction];
      const forwardY = currentPosition.y + dy[direction];
      const isWallAhead =
        forwardX < 0 ||
        forwardX >= grid.width ||
        forwardY < 0 ||
        forwardY >= grid.height ||
        grid.isWall(forwardY + forwardX * grid.width);

      if (!isWallAhead) {
        // Rule 2: Wall to the right, path ahead. Move forward.
        currentPosition.x = forwardX;
        currentPosition.y = forwardY;
      } else {
        // Rule 3: Walls to right and ahead. Turn left on the spot.
        direction = (direction + 3) % 4; // turn left
      }
    }

    // Safety check in case we somehow move out of bounds
    if (
      currentPosition.x < 0 ||
      currentPosition.x >= grid.width ||
      currentPosition.y < 0 ||
      currentPosition.y >= grid.height
    ) {
      return "done"; // Got lost
    }

    path.push({ x: currentPosition.x, y: currentPosition.y });
    visited[currentPosition.y + currentPosition.x * grid.width] = 1;

    return "exploring";
  };
}
