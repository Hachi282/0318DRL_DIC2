let n = 5;
let state = 'SET_START'; // SET_START, SET_GOAL, SET_OBSTACLES, DONE
let startCell = null;
let goalCell = null;
let obstacles = [];
const MAX_OBSTACLES = () => n - 2;

const ARROWS = {
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→'
};

document.addEventListener('DOMContentLoaded', () => {
    const btnInit = document.getElementById('btn-init');
    const inputSize = document.getElementById('grid-size');
    
    btnInit.addEventListener('click', () => {
        let val = parseInt(inputSize.value);
        if(val >= 5 && val <= 9) {
            initGrid(val);
        } else {
            alert("Please enter a value between 5 and 9");
        }
    });
    
    document.getElementById('btn-eval').addEventListener('click', runEvaluate);
    document.getElementById('btn-vi').addEventListener('click', runValueIteration);
    
    initGrid(5);
});

function updateStatus() {
    const msg = document.getElementById('status-msg');
    const evalBtn = document.getElementById('btn-eval');
    const viBtn = document.getElementById('btn-vi');
    
    evalBtn.disabled = true;
    viBtn.disabled = true;
    
    if (state === 'SET_START') {
        msg.textContent = 'Click a cell to set Start (Green)';
    } else if (state === 'SET_GOAL') {
        msg.textContent = 'Click a cell to set Goal (Red)';
    } else if (state === 'SET_OBSTACLES') {
        const obsLeft = MAX_OBSTACLES() - obstacles.length;
        msg.innerHTML = `Click to set Obstacles (Grey). <br> ${obsLeft} remaining.`;
        if (obsLeft === 0) {
            state = 'DONE';
            updateStatus();
        }
    } else if (state === 'DONE') {
        msg.textContent = 'Grid configured. Select an action below.';
        evalBtn.disabled = false;
        viBtn.disabled = false;
    }
}

function initGrid(size) {
    n = size;
    state = 'SET_START';
    startCell = null;
    goalCell = null;
    obstacles = [];
    
    const container = document.getElementById('grid-container');
    container.style.gridTemplateColumns = `repeat(${n}, var(--cell-size))`;
    container.innerHTML = '';
    
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            const policyDiv = document.createElement('div');
            policyDiv.className = 'policy';
            const valDiv = document.createElement('div');
            valDiv.className = 'value';
            
            const idDiv = document.createElement('div');
            idDiv.className = 'state-id';
            idDiv.textContent = r * n + c;
            
            cell.appendChild(idDiv);
            cell.appendChild(policyDiv);
            cell.appendChild(valDiv);
            
            cell.addEventListener('click', () => handleCellClick(cell, r, c));
            container.appendChild(cell);
        }
    }
    updateStatus();
}

function handleCellClick(cell, r, c) {
    if (state === 'SET_START') {
        cell.classList.add('start');
        startCell = [r, c];
        state = 'SET_GOAL';
        updateStatus();
    } else if (state === 'SET_GOAL') {
        if (cell.classList.contains('start')) return;
        cell.classList.add('goal');
        goalCell = [r, c];
        state = 'SET_OBSTACLES';
        updateStatus();
    } else if (state === 'SET_OBSTACLES') {
        if (cell.classList.contains('start') || cell.classList.contains('goal') || cell.classList.contains('obstacle')) return;
        
        cell.classList.add('obstacle');
        obstacles.push([r, c]);
        
        if (obstacles.length >= MAX_OBSTACLES()) {
            state = 'DONE';
        }
        updateStatus();
    }
}

function getNextState(r, c, a_idx) {
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    if (goalCell && r === goalCell[0] && c === goalCell[1]) return [r, c];
    let nr = r + dr[a_idx];
    let nc = c + dc[a_idx];
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        const isObs = obstacles.some(obs => obs[0]===nr && obs[1]===nc);
        if (!isObs) return [nr, nc];
    }
    return [r, c];
}

function runEvaluate() {
    document.getElementById('status-msg').textContent = 'Processing Policy Evaluation...';
    setTimeout(() => {
        const gamma = parseFloat(document.getElementById('param-gamma').value) || 0.9;
        const step_r = parseFloat(document.getElementById('param-step').value) || -1.0;
        const goal_r = parseFloat(document.getElementById('param-goal').value) || 0.0;
        
        let policy = {};
        for (let r=0; r<n; r++) {
            for (let c=0; c<n; c++) {
                const isObs = obstacles.some(obs => obs[0]===r && obs[1]===c);
                const isGoal = goalCell && r===goalCell[0] && c===goalCell[1];
                if (!isObs && !isGoal) policy[`${r},${c}`] = Math.floor(Math.random() * 4);
            }
        }
        
        let V = {};
        for (let r=0; r<n; r++) {
            for (let c=0; c<n; c++) V[`${r},${c}`] = 0.0;
        }
        
        const theta = 1e-4;
        let delta = 1;
        let iter = 0;
        while (delta >= theta && iter < 2000) {
            delta = 0;
            let new_V = Object.assign({}, V);
            for (let r=0; r<n; r++) {
                for (let c=0; c<n; c++) {
                    const isObs = obstacles.some(obs => obs[0]===r && obs[1]===c);
                    const isGoal = goalCell && r===goalCell[0] && c===goalCell[1];
                    if (isObs || isGoal) continue;
                    
                    const a_idx = policy[`${r},${c}`];
                    const [nr, nc] = getNextState(r, c, a_idx);
                    const isNextGoal = goalCell && nr===goalCell[0] && nc===goalCell[1];
                    const r_val = (isNextGoal && !(r===goalCell[0] && c===goalCell[1])) ? goal_r : step_r;
                    
                    const v_new = r_val + gamma * V[`${nr},${nc}`];
                    delta = Math.max(delta, Math.abs(v_new - V[`${r},${c}`]));
                    new_V[`${r},${c}`] = v_new;
                }
            }
            V = new_V;
            iter++;
        }
        
        let a_keys = ['up', 'down', 'left', 'right'];
        let formattedPolicy = {};
        for (let k in policy) formattedPolicy[k] = a_keys[policy[k]];
        
        renderResults(formattedPolicy, V, null);
        document.getElementById('status-msg').textContent = 'Random Policy Evaluation completed.';
    }, 50);
}

function runValueIteration() {
    document.getElementById('status-msg').textContent = 'Processing Value Iteration...';
    setTimeout(() => {
        const gamma = parseFloat(document.getElementById('param-gamma').value) || 0.9;
        const step_r = parseFloat(document.getElementById('param-step').value) || -1.0;
        const goal_r = parseFloat(document.getElementById('param-goal').value) || 0.0;
        
        let V = {};
        for (let r=0; r<n; r++) {
            for (let c=0; c<n; c++) V[`${r},${c}`] = 0.0;
        }
        
        const theta = 1e-4;
        let delta = 1;
        let iter = 0;
        
        while (delta >= theta && iter < 2000) {
            delta = 0;
            let new_V = Object.assign({}, V);
            for (let r=0; r<n; r++) {
                for (let c=0; c<n; c++) {
                    const isObs = obstacles.some(obs => obs[0]===r && obs[1]===c);
                    const isGoal = goalCell && r===goalCell[0] && c===goalCell[1];
                    if (isObs || isGoal) continue;
                    
                    let max_v = -Infinity;
                    for (let a=0; a<4; a++) {
                        const [nr, nc] = getNextState(r, c, a);
                        const isNextGoal = goalCell && nr===goalCell[0] && nc===goalCell[1];
                        const r_val = (isNextGoal && !(r===goalCell[0] && c===goalCell[1])) ? goal_r : step_r;
                        const v_val = r_val + gamma * V[`${nr},${nc}`];
                        if (v_val > max_v) max_v = v_val;
                    }
                    delta = Math.max(delta, Math.abs(max_v - V[`${r},${c}`]));
                    new_V[`${r},${c}`] = max_v;
                }
            }
            V = new_V;
            iter++;
        }
        
        let policy = {};
        let a_keys = ['up', 'down', 'left', 'right'];
        for (let r=0; r<n; r++) {
            for (let c=0; c<n; c++) {
                const isObs = obstacles.some(obs => obs[0]===r && obs[1]===c);
                const isGoal = goalCell && r===goalCell[0] && c===goalCell[1];
                if (isObs || isGoal) continue;
                
                let best_a = null;
                let max_v = -Infinity;
                for (let a=0; a<4; a++) {
                    const [nr, nc] = getNextState(r, c, a);
                    const isNextGoal = goalCell && nr===goalCell[0] && nc===goalCell[1];
                    const r_val = (isNextGoal && !(r===goalCell[0] && c===goalCell[1])) ? goal_r : step_r;
                    const v_val = r_val + gamma * V[`${nr},${nc}`];
                    if (v_val > max_v) {
                        max_v = v_val;
                        best_a = a;
                    }
                }
                policy[`${r},${c}`] = a_keys[best_a];
            }
        }
        
        let path = [];
        if (startCell && goalCell) {
            let curr = startCell;
            let visited = new Set();
            while ((curr[0] !== goalCell[0] || curr[1] !== goalCell[1]) && !visited.has(`${curr[0]},${curr[1]}`)) {
                visited.add(`${curr[0]},${curr[1]}`);
                path.push(curr);
                let a_str = policy[`${curr[0]},${curr[1]}`];
                if (!a_str) break;
                let a_idx = a_keys.indexOf(a_str);
                let next_s = getNextState(curr[0], curr[1], a_idx);
                if (next_s[0]===curr[0] && next_s[1]===curr[1]) break;
                curr = next_s;
            }
            if (curr[0] === goalCell[0] && curr[1] === goalCell[1]) {
                path.push(goalCell);
            }
        }
        
        renderResults(policy, V, path);
        document.getElementById('status-msg').textContent = 'Value Iteration completed.';
    }, 50);
}

function renderResults(policy, V, path) {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.querySelector('.policy').textContent = '';
        cell.querySelector('.value').textContent = '';
        cell.classList.remove('path');
    });
    
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const key = `${r},${c}`;
            const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
            
            if (policy && policy[key]) {
                cell.querySelector('.policy').textContent = ARROWS[policy[key]];
            }
            
            if (V && V[key] !== undefined) {
                let v_formatted = Math.round(V[key] * 100) / 100;
                const isObs = obstacles.some(obs => obs[0]===r && obs[1]===c);
                if (!isObs) {
                     cell.querySelector('.value').textContent = v_formatted;
                }
            }
        }
    }
    if (path) {
        path.forEach(([pr, pc]) => {
            const cell = document.querySelector(`.cell[data-r="${pr}"][data-c="${pc}"]`);
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                cell.classList.add('path');
            }
        });
    }
}
