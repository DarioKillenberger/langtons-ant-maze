/*********************************************
 * Created by:      Benjamin Moore
 * Date Created:    9/29/2015
 * Email:           Benjamin@MooreSof.com
 ********************************************/

/********************
 ***  Simulation  ***
 ********************/
function Simulation() {
  var iterator = null;
  var iterations = 0;

  /*****************
   ***  Options  ***
   *****************/
  var Options = (function () {
    var opts = {
        gridSize: 150,
        behavior: getBehaviors()[0],
        orientationIndex: 0,
        intervalCount: 1,
        milliseconds: 250,
      },
      behaviorsList;

    function getBehaviors() {
      if (behaviorsList != undefined) return behaviorsList;

      behaviorsList = [
        { turns: "RL".split(""), colors: ["#5f5", "#f55"] },
        { turns: "RLR".split(""), colors: generateRandomColors(3) },
        { turns: "LLRR".split(""), colors: generateRandomColors(4) },
        { turns: "RLLR".split(""), colors: generateRandomColors(4) },
        { turns: "LRRRRRLLR".split(""), colors: generateRandomColors(9) },
        { turns: "LLRRRLRLRLLR".split(""), colors: generateRandomColors(12) },
        { turns: "RRLLLRLLLRRR".split(""), colors: generateRandomColors(12) },
        {
          turns: "RL".split(""),
          colors: ["#003819", "#00a84c"],
          maze: true,
          name: "RL (Maze)",
        },
        {
          turns: "RLR".split(""),
          colors: ["#003819", "#00a84c", "#3677b2"],
          maze: true,
          name: "RLR (Maze)",
        },
        {
          turns: "LLRR".split(""),
          colors: ["#003819", "#00a84c", "#3677b2", "#f83737"],
          maze: true,
          name: "LLRR (Maze)",
        },
        {
          turns: "RLLR".split(""),
          colors: ["#003819", "#00a84c", "#3677b2", "#f83737"],
          maze: true,
          name: "RLLR (Maze)",
        },
        {
          turns: "LRRRRRLLR".split(""),
          colors: generateRandomColors(9),
          maze: true,
          name: "LRRRRRLLR (Maze)",
        },
        {
          turns: "LLRRRLRLRLLR".split(""),
          colors: generateRandomColors(12),
          maze: true,
          name: "LLRRRLRLRLLR (Maze)",
        },
        {
          turns: "RRLLLRLLLRRR".split(""),
          colors: generateRandomColors(12),
          maze: true,
          name: "RRLLLRLLLRRR (Maze)",
        },
      ];

      return behaviorsList;
    }

    function generateRandomColors(count) {
      var colors = [];

      for (var i = 0; i < count; i++) {
        var uniqueColor = getUniqueColor(generateRandomColor());

        colors.push(uniqueColor);
      }

      function generateRandomColor() {
        var letters = "0123456789ABCDEF".split("");
        var color = "#";

        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      function getUniqueColor(hexColor) {
        for (var i = 0, len = colors.length; i < len; i++) {
          if (colors[i] == hexColor) getUniqueColor(generateRandomColor());
        }
        return hexColor;
      }

      return colors;
    }

    (function generateBehaviorOptions() {
      var behaviors = getBehaviors();
      var behaviorElement = document.getElementById("behaviors");

      for (var y = 0, len = behaviors.length; y < len; y++) {
        var opt = "";
        // Use custom name if available, otherwise build from turns
        if (behaviors[y].name) {
          opt = behaviors[y].name;
        } else {
          for (
            var i = 0, lenTurns = behaviors[y].turns.length;
            i < lenTurns;
            i++
          ) {
            opt += behaviors[y].turns[i];
          }
        }
        behaviorElement.appendChild(new Option(opt, y));
      }
      behaviorElement.appendChild(new Option("Custom", -1));
    })();

    return {
      setGridSize: function (gridSize) {
        opts.gridSize = parseInt(gridSize);
        Grid.mazeNeedsRegen = true; // Force maze regen on size change
      },
      setAntBehavior: function (behaviorIndex) {
        opts.behavior = getBehaviors()[parseInt(behaviorIndex)];
      },
      setCustomAntBehavior: function (behaviorArray) {
        var turns = behaviorArray.split("");

        opts.behavior = {
          turns: turns,
          colors: generateRandomColors(turns.length),
        };
      },
      setAntOrientation: function (orientationIndex) {
        opts.orientationIndex = parseInt(orientationIndex);
      },
      setRefreshInterval: function (intervalCount) {
        opts.intervalCount = parseInt(intervalCount);
      },
      setRefreshDelayInterval: function (milliseconds) {
        opts.milliseconds = parseInt(milliseconds);
      },
      get: opts,
    };
  })();

  /****************
   ***  Canvas  ***
   ****************/
  var Screen = (function () {
    var antBehaviorAlgorithm = document.getElementById("displayAntBehavior");
    var iterationCount = document.getElementById("iterationCount");
    var haltMessage = document.getElementById("haltMessage");
    var canvas = document.getElementById("theBoard");
    var ctx = canvas.getContext("2d");
    var cellSize = 8;
    var cellOffset = 0.5;
    var Orientation = [
      [
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
      ], //Up - North
      [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ], //Right - East
      [
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ], //Down - South
      [
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
      ],
    ]; //Left - West

    return {
      setCanvasSize: function (size) {
        canvas.width = size;
        canvas.height = size;
      },
      clearCanvas: function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
      printGrid: function () {
        var gridCanvasSize = Options.get.gridSize * cellSize + cellSize * 2;
        this.setCanvasSize(gridCanvasSize);

        for (var x = cellOffset; x < gridCanvasSize; x += cellSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, gridCanvasSize - cellSize);
        }

        for (var y = cellOffset; y < gridCanvasSize; y += cellSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(gridCanvasSize - cellSize, y);
        }

        ctx.strokeStyle = "#555";
        ctx.stroke();
      },
      printCellState: function (cellState) {
        var x = Ant.x * cellSize + 1,
          y = Ant.y * cellSize + 1,
          wh = cellSize - 1;

        // Don't overwrite maze walls
        if (!Grid.isWall(Ant.cellIndex)) {
          ctx.fillStyle = Options.get.behavior.colors[cellState];
          //ctx.clearRect(x, y, wh, wh);
          ctx.fillRect(x, y, wh, wh);
        }
      },
      printIterationCount: function (count) {
        iterationCount.innerText = count.toLocaleString();
      },
      clearIterationCount: function () {
        iterationCount.innerText = "0";
      },
      printHaltMessage: function (message) {
        haltMessage.innerText = message;
      },
      clearHaltMessage: function () {
        haltMessage.innerText = "";
      },
      printAntOrientation: function () {
        var Screen_x = Ant.x * cellSize + cellOffset + cellSize / 2,
          Screen_y = Ant.y * cellSize + cellOffset + cellSize / 2,
          drawPoint = Orientation[Ant.orientation];

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(Screen_x + drawPoint[0].x, Screen_y + drawPoint[0].y);
        ctx.lineTo(Screen_x + drawPoint[1].x, Screen_y + drawPoint[1].y);
        ctx.lineTo(Screen_x + drawPoint[2].x, Screen_y + drawPoint[2].y);
        ctx.fill();
      },
      printBehaviorAlgorithm: function (behavior) {
        var turns = "";

        for (var i = 0, len = behavior.turns.length; i < len; i++) {
          turns +=
            '<span class="behavior" style="background-color:' +
            behavior.colors[i] +
            ' !important;"><img src="img/' +
            behavior.turns[i] +
            '.png" alt="' +
            behavior.turns[i] +
            '"/></span>';
        }

        antBehaviorAlgorithm.innerHTML = turns;
      },
      clearBehaviorAlgorithm: function () {
        antBehaviorAlgorithm.innerHTML = "";
      },
    };
  })();

  /**************
   ***  Grid  ***
   **************/
  var Grid = {
    mazeNeedsRegen: true,
    init: function () {
      this.cells = new Int8Array(
        Options.get.gridSize + Options.get.gridSize * Options.get.gridSize
      );

      // Generate maze if the current behavior has maze enabled
      if (Options.get.behavior.maze && this.mazeNeedsRegen) {
        this.mazeWalls = new Int8Array(
          Options.get.gridSize + Options.get.gridSize * Options.get.gridSize
        );
        this.generateMaze();
        this.mazeNeedsRegen = false; // Maze has been generated
      }

      Screen.clearCanvas();
      Screen.printGrid();

      if (Options.get.behavior.maze) {
        this.drawMaze();
      }
    },
    getCellState: function (cellIndex) {
      return this.cells[cellIndex];
    },
    setCellState: function (cellIndex, state) {
      this.cells[cellIndex] = state;
    },
    isWall: function (cellIndex) {
      return this.mazeWalls[cellIndex] === 1;
    },
    generateMaze: function () {
      var size = Options.get.gridSize;
      var walls = this.mazeWalls;
      var halfSize = Math.floor(size / 2);

      // Create a temporary smaller grid for maze generation
      var smallWalls = new Int8Array(halfSize * halfSize);
      for (var i = 0; i < smallWalls.length; i++) {
        smallWalls[i] = 1; // Initialize with walls
      }

      // Generate maze on the smaller grid using recursive backtracking
      var stack = [];
      var visited = new Int8Array(halfSize * halfSize);
      var startX = Math.floor(halfSize / 2);
      var startY = Math.floor(halfSize / 2);

      stack.push({ x: startX, y: startY });
      visited[startY * halfSize + startX] = 1;
      smallWalls[startY * halfSize + startX] = 0;

      var directions = [
        { dx: 0, dy: -2 },
        { dx: 2, dy: 0 },
        { dx: 0, dy: 2 },
        { dx: -2, dy: 0 },
      ];

      while (stack.length > 0) {
        var current = stack[stack.length - 1];
        var unvisited = [];

        for (var i = 0; i < directions.length; i++) {
          var newX = current.x + directions[i].dx;
          var newY = current.y + directions[i].dy;

          if (
            newX >= 0 &&
            newX < halfSize &&
            newY >= 0 &&
            newY < halfSize &&
            !visited[newY * halfSize + newX]
          ) {
            unvisited.push({ x: newX, y: newY, dir: i });
          }
        }

        if (unvisited.length > 0) {
          var next = unvisited[Math.floor(Math.random() * unvisited.length)];
          var wallX = current.x + directions[next.dir].dx / 2;
          var wallY = current.y + directions[next.dir].dy / 2;

          smallWalls[wallY * halfSize + wallX] = 0;
          smallWalls[next.y * halfSize + next.x] = 0;
          visited[next.y * halfSize + next.x] = 1;
          stack.push(next);
        } else {
          stack.pop();
        }
      }

      // Create an exit on the small maze and connect it
      var edge = Math.floor(Math.random() * 4);
      var exitX, exitY;
      switch (edge) {
        case 0: // Top
          exitX = Math.floor(Math.random() * (halfSize - 2)) + 1;
          exitY = 0;
          smallWalls[exitY * halfSize + exitX] = 0; // Carve exit
          smallWalls[(exitY + 1) * halfSize + exitX] = 0; // Connect it
          break;
        case 1: // Right
          exitX = halfSize - 1;
          exitY = Math.floor(Math.random() * (halfSize - 2)) + 1;
          smallWalls[exitY * halfSize + exitX] = 0; // Carve exit
          smallWalls[exitY * halfSize + (exitX - 1)] = 0; // Connect it
          break;
        case 2: // Bottom
          exitX = Math.floor(Math.random() * (halfSize - 2)) + 1;
          exitY = halfSize - 1;
          smallWalls[exitY * halfSize + exitX] = 0; // Carve exit
          smallWalls[(exitY - 1) * halfSize + exitX] = 0; // Connect it
          break;
        case 3: // Left
          exitX = 0;
          exitY = Math.floor(Math.random() * (halfSize - 2)) + 1;
          smallWalls[exitY * halfSize + exitX] = 0; // Carve exit
          smallWalls[exitY * halfSize + (exitX + 1)] = 0; // Connect it
          break;
      }

      // Scale up the small maze to the full grid
      for (var y = 0; y < halfSize; y++) {
        for (var x = 0; x < halfSize; x++) {
          var isPath = smallWalls[y * halfSize + x] === 0;
          for (var dy = 0; dy < 2; dy++) {
            for (var dx = 0; dx < 2; dx++) {
              var fullX = x * 2 + dx;
              var fullY = y * 2 + dy;
              if (fullX < size && fullY < size) {
                walls[fullY * size + fullX] = isPath ? 0 : 1;
              }
            }
          }
        }
      }

      // Ensure the center area is clear for the ant to start
      var centerStartX = Math.floor(size / 2);
      var centerStartY = Math.floor(size / 2);
      var centerSize = Math.min(10, Math.floor(size / 10));
      for (
        var x = centerStartX - centerSize;
        x <= centerStartX + centerSize;
        x++
      ) {
        for (
          var y = centerStartY - centerSize;
          y <= centerStartY + centerSize;
          y++
        ) {
          if (x >= 0 && x < size && y >= 0 && y < size) {
            walls[y * size + x] = 0;
          }
        }
      }
    },
    drawMaze: function () {
      var size = Options.get.gridSize;
      var cellSize = 8;

      for (var x = 0; x < size; x++) {
        for (var y = 0; y < size; y++) {
          var index = y + x * size;
          if (this.mazeWalls[index] === 1) {
            var screenX = x * cellSize + 1;
            var screenY = y * cellSize + 1;
            var wh = cellSize - 1;

            var ctx = document.getElementById("theBoard").getContext("2d");
            ctx.fillStyle = "#000";
            ctx.fillRect(screenX, screenY, wh, wh);
          }
        }
      }
    },
  };

  /*************
   ***  Ant  ***
   *************/
  var Ant = {
    init: function () {
      //Put the ant in the middle of the grid
      this.x = Math.floor(Options.get.gridSize / 2);
      this.y = Math.floor(Options.get.gridSize / 2);

      //Point the ant in a North:0, East:1, South:2, or West:3
      this.orientation = Options.get.orientationIndex;

      //Get the index of the cell the ant was placed on
      this.cellIndex = this.y + this.x * Options.get.gridSize;
    },
    turn: function (cellState) {
      if (Options.get.behavior.turns[cellState] === "R") {
        this.orientation = (this.orientation + 5) % 4;
      } else {
        this.orientation = (this.orientation + 3) % 4;
      }
    },
    move: function () {
      var newX = this.x;
      var newY = this.y;

      if (!(this.orientation % 2)) {
        newY += this.orientation - 1;
      } else {
        newX -= this.orientation - 2;
      }

      var newCellIndex = newY + newX * Options.get.gridSize;

      // Check if the new position is within bounds and not a wall
      if (
        newX >= 0 &&
        newX < Options.get.gridSize &&
        newY >= 0 &&
        newY < Options.get.gridSize &&
        !Grid.isWall(newCellIndex)
      ) {
        this.x = newX;
        this.y = newY;
        this.cellIndex = newCellIndex;
      }
      // If it's a wall, the ant stays in place (doesn't move)
    },
  };

  function runStep() {
    var currentCellState = Grid.getCellState(Ant.cellIndex);
    var newCellState =
      (currentCellState + 1) % Options.get.behavior.colors.length;

    Grid.setCellState(Ant.cellIndex, newCellState);

    Screen.printCellState(currentCellState);
    Screen.printAntOrientation();

    Ant.turn(currentCellState);
    Ant.move();

    // Halt condition for maze mode: stop when the ant reaches the edge
    if (Options.get.behavior.maze) {
      var gridSize = Options.get.gridSize;
      if (
        Ant.x <= 0 ||
        Ant.x >= gridSize - 1 ||
        Ant.y <= 0 ||
        Ant.y >= gridSize - 1
      ) {
        // Color the final cell before halting
        var finalCellState = Grid.getCellState(Ant.cellIndex);
        Screen.printCellState(finalCellState);
        Screen.printAntOrientation();
        return "edge"; // Halt simulation
      }
    }

    if (Ant.cellIndex < 0 || Ant.cellIndex > Grid.cells.length) {
      return "bounds";
    }

    return false;
  }

  function runSteps() {
    for (var i = 0, intervals = Options.get.intervalCount; i < intervals; i++) {
      if (iterations >= 2000000) {
        Screen.printHaltMessage("Halted: Maximum steps reached.");
        clearInterval(iterator);
        break;
      }
      var haltReason = runStep();
      if (haltReason) {
        if (haltReason === "edge") {
          Screen.printHaltMessage("Halted: Ant reached the edge of the board.");
        } else if (haltReason === "bounds") {
          Screen.printHaltMessage("Halted: Ant went off the grid.");
        }
        clearInterval(iterator);
        Screen.printIterationCount(iterations);
        break;
      }
      iterations++;
    }

    Screen.printIterationCount(iterations);
  }

  function run() {
    reset();

    iterator = setInterval(runSteps, Options.get.milliseconds);

    Screen.printBehaviorAlgorithm(Options.get.behavior);
  }

  function reset() {
    clearInterval(iterator);
    iterations = 0;
    Screen.clearBehaviorAlgorithm();
    Screen.clearIterationCount();
    Screen.clearHaltMessage();
    Grid.init();
    Ant.init();
  }

  return {
    run: run,
    reset: reset,
    Options: Options,
    refreshMaze: function () {
      if (Options.get.behavior.maze) {
        Grid.mazeNeedsRegen = true;
        run();
      }
    },
    setRefreshInterval: function (intervalCount) {
      Options.setRefreshInterval(intervalCount);
    },
    setRefreshDelayInterval: function (milliseconds) {
      Options.setRefreshDelayInterval(milliseconds);
      clearInterval(iterator);
      iterator = setInterval(runSteps, Options.get.milliseconds);
    },
  };
}
