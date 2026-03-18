from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)

ACTIONS = {
    'up': (-1, 0),
    'down': (1, 0),
    'left': (0, -1),
    'right': (0, 1)
}
ACTION_IDX = ['up', 'down', 'left', 'right']

@app.route('/')
def index():
    return render_template('index.html')

def get_next_state(s, a_idx, n, obstacles, goal):
    if s == goal:
        return s
    
    dr, dc = ACTIONS[ACTION_IDX[a_idx]]
    r, c = s
    nr, nc = r + dr, c + dc
    
    if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in obstacles:
        return (nr, nc)
    return s

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    n = data.get('n', 5)
    start = tuple(data.get('start', [0,0]))
    goal = tuple(data.get('end', [n-1, n-1]))
    obstacles = set(tuple(o) for o in data.get('obstacles', []))
    
    # Generate random policy
    policy = {}
    for r in range(n):
        for c in range(n):
            if (r, c) not in obstacles and (r, c) != goal:
                policy[(r, c)] = np.random.choice(4)
            else:
                policy[(r, c)] = None
                
    # Policy Evaluation
    V = { (r,c): 0.0 for r in range(n) for c in range(n) }
    gamma = float(data.get('gamma', 0.9))
    step_reward = float(data.get('step_reward', -1.0))
    goal_reward = float(data.get('goal_reward', 0.0))
    theta = 1e-4
    
    while True:
        delta = 0
        new_V = V.copy()
        for r in range(n):
            for c in range(n):
                s = (r, c)
                if s in obstacles or s == goal:
                    continue
                a_idx = policy[s]
                ns = get_next_state(s, a_idx, n, obstacles, goal)
                r_val = goal_reward if ns == goal and s != goal else step_reward
                v_new = r_val + gamma * V[ns]
                delta = max(delta, abs(v_new - V[s]))
                new_V[s] = v_new
        V = new_V
        if delta < theta:
            break
            
    return jsonify({
        'policy': {f"{r},{c}": ACTION_IDX[a] for (r,c), a in policy.items() if a is not None},
        'values': {f"{r},{c}": round(v, 2) for (r,c), v in V.items() if (r,c) not in obstacles}
    })

@app.route('/api/value_iteration', methods=['POST'])
def value_iteration():
    data = request.json
    n = data.get('n', 5)
    start = tuple(data.get('start', [0,0]))
    goal = tuple(data.get('end', [n-1, n-1]))
    obstacles = set(tuple(o) for o in data.get('obstacles', []))
    
    V = { (r,c): 0.0 for r in range(n) for c in range(n) }
    gamma = float(data.get('gamma', 0.9))
    step_reward = float(data.get('step_reward', -1.0))
    goal_reward = float(data.get('goal_reward', 0.0))
    theta = 1e-4
    
    while True:
        delta = 0
        new_V = V.copy()
        for r in range(n):
            for c in range(n):
                s = (r, c)
                if s in obstacles or s == goal:
                    continue
                max_v = float('-inf')
                for a_idx in range(4):
                    ns = get_next_state(s, a_idx, n, obstacles, goal)
                    r_val = goal_reward if ns == goal and s != goal else step_reward
                    v_val = r_val + gamma * V[ns]
                    if v_val > max_v:
                        max_v = v_val
                delta = max(delta, abs(max_v - V[s]))
                new_V[s] = max_v
        V = new_V
        if delta < theta:
            break
            
    # Extract optimal policy
    policy = {}
    for r in range(n):
        for c in range(n):
            s = (r, c)
            if s in obstacles or s == goal:
                continue
            best_a = None
            max_v = float('-inf')
            
            for a_idx in range(4):
                ns = get_next_state(s, a_idx, n, obstacles, goal)
                r_val = goal_reward if ns == goal and s != goal else step_reward
                v_val = r_val + gamma * V[ns]
                if v_val > max_v:
                    max_v = v_val
                    best_a = a_idx
            policy[s] = ACTION_IDX[best_a]
            
    # Trace path from start to goal
    path = []
    curr = start
    visited = set()
    while curr != goal and curr not in visited:
        visited.add(curr)
        path.append(list(curr))
        a_str = policy.get(curr)
        if not a_str:
            break
        a_idx = ACTION_IDX.index(a_str)
        ns = get_next_state(curr, a_idx, n, obstacles, goal)
        if ns == curr:
            break
        curr = ns
    if curr == goal:
        path.append(list(goal))
            
    return jsonify({
        'policy': {f"{r},{c}": p for (r,c), p in policy.items()},
        'values': {f"{r},{c}": round(v, 2) for (r,c), v in V.items() if (r,c) not in obstacles},
        'path': path
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
