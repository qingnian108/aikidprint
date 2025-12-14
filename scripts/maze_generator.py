"""
迷宫生成器 - Python 版本
支持正方形迷宫、难度级别和答案生成

使用方法:
    python scripts/maze_generator.py [选项]

示例:
    python scripts/maze_generator.py -d easy -o maze.svg
    python scripts/maze_generator.py -d hard --solution -o maze_hard.svg
"""

import random
import argparse
from typing import List
from collections import deque


# 难度配置
DIFFICULTY_CONFIG = {
    'easy': {'size': 10, 'algorithm': 'kruskal'},
    'medium': {'size': 15, 'algorithm': 'kruskal'},
    'hard': {'size': 22, 'algorithm': 'dfs'},
}


class MazeGenerator:
    """正方形迷宫生成器"""
    
    def __init__(self, size: int = 12):
        self.size = size
        self.grid = [[1] * (2 * size + 1) for _ in range(2 * size + 1)]
        self.start = (1, 0)  # 入口位置
        self.end = (2 * size - 1, 2 * size)  # 出口位置
        self.solution_path = []
    
    def generate(self, algorithm: str = 'dfs') -> List[List[int]]:
        """生成迷宫"""
        for i in range(self.size):
            for j in range(self.size):
                self.grid[2 * i + 1][2 * j + 1] = 0
        
        if algorithm == 'dfs':
            self._generate_dfs()
        elif algorithm == 'kruskal':
            self._generate_kruskal()
        elif algorithm == 'prim':
            self._generate_prim()
        elif algorithm == 'bfs':
            self._generate_bfs()
        else:
            self._generate_dfs()
        
        # 设置入口（加宽开口）
        self.grid[self.start[0]][self.start[1]] = 0
        if self.start[0] + 1 < len(self.grid):
            self.grid[self.start[0] + 1][self.start[1]] = 0
        if self.start[0] - 1 >= 0:
            self.grid[self.start[0] - 1][self.start[1]] = 0
        
        # 设置出口（加宽开口）
        self.grid[self.end[0]][self.end[1]] = 0
        if self.end[0] + 1 < len(self.grid):
            self.grid[self.end[0] + 1][self.end[1]] = 0
        if self.end[0] - 1 >= 0:
            self.grid[self.end[0] - 1][self.end[1]] = 0
        
        self._solve()
        
        return self.grid
    
    def _generate_dfs(self):
        """深度优先搜索生成迷宫"""
        visited = [[False] * self.size for _ in range(self.size)]
        stack = [(0, 0)]
        visited[0][0] = True
        
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        
        while stack:
            x, y = stack[-1]
            neighbors = []
            
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if 0 <= nx < self.size and 0 <= ny < self.size and not visited[nx][ny]:
                    neighbors.append((nx, ny, dx, dy))
            
            if neighbors:
                nx, ny, dx, dy = random.choice(neighbors)
                self.grid[2 * x + 1 + dx][2 * y + 1 + dy] = 0
                visited[nx][ny] = True
                stack.append((nx, ny))
            else:
                stack.pop()
    
    def _generate_kruskal(self):
        """Kruskal 算法生成迷宫"""
        parent = {}
        
        def find(x):
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]
        
        def union(x, y):
            px, py = find(x), find(y)
            if px != py:
                parent[px] = py
                return True
            return False
        
        for i in range(self.size):
            for j in range(self.size):
                parent[(i, j)] = (i, j)
        
        walls = []
        for i in range(self.size):
            for j in range(self.size):
                if j < self.size - 1:
                    walls.append(((i, j), (i, j + 1)))
                if i < self.size - 1:
                    walls.append(((i, j), (i + 1, j)))
        
        random.shuffle(walls)
        
        for cell1, cell2 in walls:
            if union(cell1, cell2):
                x1, y1 = cell1
                x2, y2 = cell2
                wall_x = 2 * x1 + 1 + (x2 - x1)
                wall_y = 2 * y1 + 1 + (y2 - y1)
                self.grid[wall_x][wall_y] = 0
    
    def _generate_prim(self):
        """Prim 算法生成迷宫"""
        visited = [[False] * self.size for _ in range(self.size)]
        walls = []
        
        start_x, start_y = random.randint(0, self.size - 1), random.randint(0, self.size - 1)
        visited[start_x][start_y] = True
        
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        
        for dx, dy in directions:
            nx, ny = start_x + dx, start_y + dy
            if 0 <= nx < self.size and 0 <= ny < self.size:
                walls.append((start_x, start_y, nx, ny))
        
        while walls:
            idx = random.randint(0, len(walls) - 1)
            x1, y1, x2, y2 = walls.pop(idx)
            
            if not visited[x2][y2]:
                visited[x2][y2] = True
                self.grid[x1 + x2 + 1][y1 + y2 + 1] = 0
                
                for dx, dy in directions:
                    nx, ny = x2 + dx, y2 + dy
                    if 0 <= nx < self.size and 0 <= ny < self.size and not visited[nx][ny]:
                        walls.append((x2, y2, nx, ny))
    
    def _generate_bfs(self):
        """广度优先搜索生成迷宫"""
        visited = [[False] * self.size for _ in range(self.size)]
        queue = deque([(0, 0)])
        visited[0][0] = True
        
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        
        while queue:
            x, y = queue.popleft()
            neighbors = []
            
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if 0 <= nx < self.size and 0 <= ny < self.size and not visited[nx][ny]:
                    neighbors.append((nx, ny, dx, dy))
            
            random.shuffle(neighbors)
            
            for nx, ny, dx, dy in neighbors:
                if not visited[nx][ny]:
                    visited[nx][ny] = True
                    self.grid[2 * x + 1 + dx][2 * y + 1 + dy] = 0
                    queue.append((nx, ny))
    
    def _solve(self):
        """使用 BFS 找到从入口到出口的最短路径"""
        rows, cols = len(self.grid), len(self.grid[0])
        start = (self.start[0], self.start[1])
        end = (self.end[0], self.end[1])
        
        visited = set()
        parent = {}
        queue = deque([start])
        visited.add(start)
        parent[start] = None
        
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        
        while queue:
            r, c = queue.popleft()
            
            if (r, c) == end:
                path = []
                current = end
                while current is not None:
                    path.append(current)
                    current = parent[current]
                self.solution_path = path[::-1]
                return
            
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    if (nr, nc) not in visited and self.grid[nr][nc] == 0:
                        visited.add((nr, nc))
                        parent[(nr, nc)] = (r, c)
                        queue.append((nr, nc))
    
    def to_svg(self, cell_size: int = 25, wall_width: int = 3, show_solution: bool = False) -> str:
        """导出为 SVG 格式"""
        # 迷宫实际尺寸
        maze_width = self.size * cell_size
        maze_height = self.size * cell_size
        
        # 添加边距让迷宫居中
        padding = cell_size * 2
        svg_width = maze_width + padding * 2
        svg_height = maze_height + padding * 2
        
        # 偏移量（让迷宫居中）
        offset_x = padding
        offset_y = padding
        
        lines = []
        lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" '
                    f'width="{svg_width}" height="{svg_height}" '
                    f'viewBox="0 0 {svg_width} {svg_height}">')
        # 不添加白色背景，保持透明
        
        # 绘制解答路径
        if show_solution and self.solution_path:
            path_points = []
            for r, c in self.solution_path:
                x = (c // 2 + 0.5) * cell_size if c % 2 == 1 else (c // 2) * cell_size
                y = (r // 2 + 0.5) * cell_size if r % 2 == 1 else (r // 2) * cell_size
                path_points.append(f'{x + offset_x},{y + offset_y}')
            
            lines.append(f'<polyline points="{" ".join(path_points)}" '
                        f'stroke="#FF6B6B" stroke-width="4" fill="none" '
                        f'stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>')
        
        # 绘制墙壁
        for i in range(len(self.grid)):
            for j in range(len(self.grid[0])):
                if self.grid[i][j] == 1:
                    if i % 2 == 0 and j % 2 == 1:
                        x1 = (j // 2) * cell_size + offset_x
                        y1 = (i // 2) * cell_size + offset_y
                        x2 = x1 + cell_size
                        y2 = y1
                        lines.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                                   f'stroke="black" stroke-width="{wall_width}" stroke-linecap="round"/>')
                    elif i % 2 == 1 and j % 2 == 0:
                        x1 = (j // 2) * cell_size + offset_x
                        y1 = (i // 2) * cell_size + offset_y
                        x2 = x1
                        y2 = y1 + cell_size
                        lines.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                                   f'stroke="black" stroke-width="{wall_width}" stroke-linecap="round"/>')
        

        
        lines.append('</svg>')
        return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='正方形迷宫生成器')
    parser.add_argument('-d', '--difficulty', default='medium',
                       choices=['easy', 'medium', 'hard'],
                       help='难度: easy(12x12), medium(15x15), hard(22x22)')
    parser.add_argument('-a', '--algorithm', default=None,
                       choices=['dfs', 'kruskal', 'prim', 'bfs'],
                       help='生成算法（默认根据难度自动选择）')
    parser.add_argument('-s', '--size', type=int, default=None, help='迷宫大小（覆盖难度设置）')
    parser.add_argument('-o', '--output', default='maze.svg', help='输出文件')
    parser.add_argument('--solution', action='store_true', help='显示解答路径')
    parser.add_argument('-c', '--cell-size', type=int, default=25, help='单元格大小')
    
    args = parser.parse_args()
    
    config = DIFFICULTY_CONFIG[args.difficulty]
    algorithm = args.algorithm or config['algorithm']
    size = args.size or config['size']
    
    maze = MazeGenerator(size)
    maze.generate(algorithm)
    
    svg = maze.to_svg(args.cell_size, show_solution=args.solution)
    
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(svg)
    
    print(f"[Maze] Generated: {args.output}")
    print(f"   - Size: {size} x {size}")
    print(f"   - Difficulty: {args.difficulty}")
    print(f"   - Algorithm: {algorithm}")
    if args.solution:
        print(f"   - Solution: shown")


if __name__ == '__main__':
    main()
