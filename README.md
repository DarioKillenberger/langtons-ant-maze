## A fork of Langton's Ant to add options to run the ant within a maze.

The following changes have been made:

- added options which have a maze pattern on the grid before it starts. For these options, if the ant would walk into the maze, it instead stays on the current tile, but modifies the colour to the next one in the sequence
- added halting condition of reaching the edge of the tiles (meaning the ant has escaped the maze)
- added halting condition of 2 million turns. This makes it easier to compare how different variations (more letters, different R L sequences...) of Langton's ant perform in escaping the maze
- added halt message to tell us whether we halted due to reaching the board edge, or because we reached 2 million steps
- modified the timing controls to not reset the progress of the ant, as this makes it easier for us to observe it at various stages
- added the following behaviour options: RL (original langton’s ant), RLR (has a tendency to get stuck in the maze), LLRR (tendency to get stuck in maze), RLLR (possibly the best path-finder), LRRRRRLLR (this turns out to be quite a good pathfinder algorithm too, once it breaks out of the initial open centre square), LLRRRLRLRLLR (meh pathfinder, has a tendency to explore a few paths and then get stuck in the centre), RRLLLRLLLRRR (tends to get stuck, but sometimes finds the exit).

Additionally, the maze will remain the same, unless the ‘refresh maze’ button is clicked, which ensures I can test different machines on the same maze.

#### Additions for V2

New "Anti-RH-Rule" Maze generation option which uses Kruskal's algorithm to create a harder maze. I've then tried to make it even harder for simple wall-following algorithms by adding:

- Open region: A large, open area with many interconnected paths.
- Additional Loops: Some more loops are created by removing 20% of dead ends.
- Wall Islands: Isolated walls are placed in open areas to disrupt wall-following.

### How to Run

To run, you can use

```
npx serve .
```
