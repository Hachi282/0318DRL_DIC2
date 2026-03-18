# 🤖 Reinforcement Learning Gridworld HW1

This project implements an interactive web-based Gridworld environment designed to visualize fundamental Reinforcement Learning algorithms, specifically **Policy Evaluation** and **Value Iteration**. Users can dynamically modify the Markov Decision Process (MDP) parameters and observe how policies structurally adjust and converge toward optimal paths to the goal while evading obstacles.

---

## 🎮 Online Demo
**[👉 Play the Interactive Online Demo Here!](https://hachi282.github.io/0318DRL_DIC2/)**

> **Note**: The GitHub Pages demo runs a pure JavaScript frontend-only version of the algorithms, so no backend setting up is required!

---

## 🌟 Key Features

1. **Interactive Grid Creation**: Choose your custom map size $n \times n$ (ranging from 5 to 9).
2. **Custom States Configuration**: Simply click cells on the UI to place the **Start point (Green)**, the **Goal state (Red)**, and the **Obstacles (Grey)**.
3. **Number Identifiers**: Each grid cell is uniquely labeled with an ID block ( $r \times n + c$ ) so you can distinctly identify grid coordinates.
4. **Adjustable RL Parameters**: Directly inject your learning parameters into the evaluation metrics via the top control panel:
   - **Discount Factor ($\gamma$)**: The importance of future rewards over immediate step rewards (default: `0.9`).
   - **Step Reward**: The penalty/reward for taking any standard transition (default: `-1.0`).
   - **Goal Reward**: The reward received immediately upon reaching the final destination (default: `0.0`).
5. **Algorithm 1 - Policy Evaluation**: Generates a completely random direction configuration ("Random Policy"). Activating this will iteratively evaluate the state values ($V(s)$) and present mathematical proofs (such as `-10` value convergence) identifying exactly how badly an agent performs behaving randomly.
6. **Algorithm 2 - Value Iteration**: Executes the Value Iteration algorithm recursively computing the true optimal values $V^*(s)$ across all valid states and deduces the absolute best deterministic actions ( $\pi^*(s)$ ) from any given square to the goal node.
7. **Path Tracing**: During Value Iteration, the system will highlight the exact optimal trajectory from your `Start` back to your `Goal` by laying out a connected bright yellow trail!

---

## 📖 How to Use

### 1. Using the Web UI
1. Select the **Grid Size** and click **Initialize Grid**.
2. Click anywhere on the map to set the **Start State (Green)**.
3. Click another box to set the **Goal State (Red)**.
4. Click up to $n-2$ remaining boxes to designate **Obstacles (Grey)**.
5. In the **parameters menu**, tweak the Math values manually if you want a custom environment.
6. Click **Random Policy & Evaluate** to see numbers derived under an unconstrained randomized setup. 
7. Click **Run Value Iteration (Optimal)** to see the map flawlessly calculate and highlight the shortest yellow path to the red target box.

### 2. Running the Pure Frontend (Static Site)
Simply host the `/docs` directory via Live Server, upload to GitHub Pages, or directly open `docs/index.html` locally in a modern web browser to utilize the client-side algorithms natively.

### 3. Running the Original Flask Backend (Local Option)
If you wish to test out the original Python backend implementation:

**1. Install dependencies**
```bash
pip install -r requirements.txt
```
**2. Run the application**
```bash
python app.py
```
**3. Access on Localhost**
Open `http://127.0.0.1:5000` in your browser.

---

## 🛠️ Architecture Overview
This workspace maintains two unified versions of the environment simultaneously:
- **Python / Flask (Backend)**: Handled by `app.py` manipulating state data passed from `templates/` and `static/`. Iterations are processed locally in Python then returned universally.
- **JavaScript Static (`docs/`)**: The independent architecture required specifically for GitHub pages deployment formatting. 100% of the transitions, RL calculations, and updates happen securely via vanilla JS entirely handled on the browser side.

---

## 📜 Development & Conversation Log
All development frameworks, step progression, and dialogues with the AI assistant have been meticulously documented.
You can view the full development history / prompt sequences **[here](./conversation_log.md)**.
