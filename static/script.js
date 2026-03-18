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
    
    document.getElementById('btn-eval').addEventListener('click', () => callAPI('/api/evaluate'));
    document.getElementById('btn-vi').addEventListener('click', () => callAPI('/api/value_iteration'));
    
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

async function callAPI(endpoint) {
    document.getElementById('status-msg').textContent = 'Processing...';
    try {
        const gammaVal = parseFloat(document.getElementById('param-gamma').value) || 0.9;
        const stepVal = parseFloat(document.getElementById('param-step').value) || -1.0;
        const goalVal = parseFloat(document.getElementById('param-goal').value) || 0.0;
        
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                n: n,
                start: startCell,
                end: goalCell,
                obstacles: obstacles,
                gamma: gammaVal,
                step_reward: stepVal,
                goal_reward: goalVal
            })
        });
        const data = await res.json();
        
        // Clear old policy/values/paths form grid
        document.querySelectorAll('.cell').forEach(cell => {
            cell.querySelector('.policy').textContent = '';
            cell.querySelector('.value').textContent = '';
            cell.classList.remove('path');
        });
        
        // Update cells based on API response
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const key = `${r},${c}`;
                const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
                
                if (data.policy && data.policy[key]) {
                    cell.querySelector('.policy').textContent = ARROWS[data.policy[key]];
                }
                
                if (data.values && data.values[key] !== undefined) {
                    let v = data.values[key];
                    cell.querySelector('.value').textContent = v;
                }
            }
        }
        if (data.path) {
            data.path.forEach(([r, c]) => {
                const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
                if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                    cell.classList.add('path');
                }
            });
        }
        document.getElementById('status-msg').textContent = 'Algorithm execution completed. Check grid results.';
        
    } catch (err) {
        console.error(err);
        document.getElementById('status-msg').textContent = 'Error executing algorithm. Check console.';
    }
}
