# Reinforcement Learning Gridworld HW1

This project implements a web-based Gridworld environment to visualize Reinforcement Learning algorithms, specifically Policy Evaluation and Value Iteration.

## Online Demo
👉 **[Play the Online Demo Here!](https://hachi282.github.io/0318DRL_DIC2/)** 

## Features
- **Interactive Grid Map**: Define grid sizes from 5x5 to 9x9.
- **Set States**: Click to set Start (Green), Goal (Red), and Obstacles (Grey).
- **Custom Parameters**: Adjust Discount Factor ($\gamma$), Step Reward, and Goal Reward directly from the UI.
- **Policy Evaluation**: Evaluates a random policy and displays state values $V(s)$.
- **Value Iteration**: Computes and visually traces the optimal policy path from the start to the goal.

## Architecture
- `app.py` / `templates/` / `static/`: The original Flask backend implementation.
- `docs/`: A pure JavaScript static version of the environment, actively hosted via GitHub Pages without the need for a Python backend.

## Development & Conversation Log
All development steps and dialogues with the AI have been documented in `conversation_log.md`. 
You can view the full development history **[here](./conversation_log.md)**.
