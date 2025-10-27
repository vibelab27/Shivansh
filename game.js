// Game constants
const GRID_SIZE = 28;
const CELL_SIZE = 15;

// Game states
let score = 0;
let highScore = 0;
let lives = 3;
let gameBoard = [];
let dotsRemaining = 0;
let pacmanPosition = { x: 14, y: 23 }; // Starting position
let ghostPosition = { x: 14, y: 11 }; // Starting position
let gameInterval;
let lastDirection = 'ArrowRight';
let isGameActive = false;

// Initialize the game board
function initializeBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    gameBoard = [];
    score = 0;
    updateScore();
    dotsRemaining = 0;

    // Create the maze layout (1 = wall, 0 = path with dot)
    for (let i = 0; i < GRID_SIZE; i++) {
        gameBoard[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Create maze pattern
            if (i === 0 || i === GRID_SIZE-1 || j === 0 || j === GRID_SIZE-1 || 
                (i % 2 === 0 && j % 2 === 0 && i !== GRID_SIZE-2 && j !== GRID_SIZE-2)) {
                cell.classList.add('wall');
                gameBoard[i][j] = 1;
            } else {
                // Add dots except in pacman and ghost starting positions
                if (!(i === pacmanPosition.y && j === pacmanPosition.x) && 
                    !(i === ghostPosition.y && j === ghostPosition.x)) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    cell.appendChild(dot);
                    dotsRemaining++;
                }
                gameBoard[i][j] = 0;
            }
            
            board.appendChild(cell);
        }
    }

    // Place Pac-Man
    placePacman(pacmanPosition);

    // Place Ghost
    placeGhost(ghostPosition);
}

// Place Pac-Man on the board
function placePacman(position) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('pacman'));
    const index = position.y * GRID_SIZE + position.x;
    cells[index].classList.add('pacman');
    cells[index].innerHTML = '';  // Remove dot if present
}

// Place Ghost on the board
function placeGhost(position) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('ghost'));
    const index = position.y * GRID_SIZE + position.x;
    cells[index].classList.add('ghost');
}

// Move Pac-Man
function movePacman(direction) {
    const newPosition = { ...pacmanPosition };
    let moved = false;
    
    switch(direction) {
        case 'ArrowUp':
            if (isValidMove({ ...newPosition, y: newPosition.y - 1 })) {
                newPosition.y--;
                moved = true;
            }
            break;
        case 'ArrowDown':
            if (isValidMove({ ...newPosition, y: newPosition.y + 1 })) {
                newPosition.y++;
                moved = true;
            }
            break;
        case 'ArrowLeft':
            if (isValidMove({ ...newPosition, x: newPosition.x - 1 })) {
                newPosition.x--;
                moved = true;
            }
            break;
        case 'ArrowRight':
            if (isValidMove({ ...newPosition, x: newPosition.x + 1 })) {
                newPosition.x++;
                moved = true;
            }
            break;
    }

    if (moved) {
        pacmanPosition = newPosition;
        const cells = document.querySelectorAll('.cell');
        const index = pacmanPosition.y * GRID_SIZE + pacmanPosition.x;
        
        // Check if there's a dot to eat
        const dot = cells[index].querySelector('.dot');
        if (dot) {
            dot.remove();
            score += 10;
            dotsRemaining--;
            updateScore();
            
            // Check if all dots are collected
            if (dotsRemaining === 0) {
                endGame(true); // Win condition
                return;
            }
        }
        
        placePacman(pacmanPosition);
        checkCollision();
    }
}

// Move Ghost
function moveGhost() {
    // Simple ghost AI: Move towards Pac-Man
    const newPosition = { ...ghostPosition };
    
    // Horizontal movement
    if (ghostPosition.x < pacmanPosition.x && isValidMove({ ...ghostPosition, x: ghostPosition.x + 1 })) {
        newPosition.x++;
    } else if (ghostPosition.x > pacmanPosition.x && isValidMove({ ...ghostPosition, x: ghostPosition.x - 1 })) {
        newPosition.x--;
    }
    // Vertical movement
    else if (ghostPosition.y < pacmanPosition.y && isValidMove({ ...ghostPosition, y: ghostPosition.y + 1 })) {
        newPosition.y++;
    } else if (ghostPosition.y > pacmanPosition.y && isValidMove({ ...ghostPosition, y: ghostPosition.y - 1 })) {
        newPosition.y--;
    }

    ghostPosition = newPosition;
    placeGhost(ghostPosition);
    checkCollision();
}

// Check if a move is valid (not hitting a wall)
function isValidMove(position) {
    return position.x >= 0 && position.x < GRID_SIZE &&
           position.y >= 0 && position.y < GRID_SIZE &&
           gameBoard[position.y][position.x] !== 1;
}

// Check for collision between Pac-Man and Ghost
function checkCollision() {
    if (pacmanPosition.x === ghostPosition.x && pacmanPosition.y === ghostPosition.y) {
        lives--;
        document.getElementById('lives').textContent = lives;
        
        if (lives <= 0) {
            endGame();
        } else {
            resetPositions();
        }
    }
}

// Reset positions after losing a life
function resetPositions() {
    pacmanPosition = { x: 14, y: 23 };
    ghostPosition = { x: 14, y: 11 };
    placePacman(pacmanPosition);
    placeGhost(ghostPosition);
}

// Update the score display
function updateScore() {
    document.getElementById('current-score').textContent = score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('high-score').textContent = highScore;
    }
}

// End the game
function endGame(isWin = false) {
    clearInterval(gameInterval);
    isGameActive = false;
    
    // Update game over screen
    document.getElementById('final-score').textContent = score;
    document.getElementById('end-high-score').textContent = highScore;
    
    let message;
    if (isWin) {
        message = "Congratulations! You've won!";
    } else if (score === highScore && score > 0) {
        message = "New High Score! Congratulations!";
    } else if (lives <= 0) {
        message = "Out of lives! Better luck next time!";
    } else {
        message = "Game Over!";
    }
    document.getElementById('game-over-message').textContent = message;
    
    // Show game over screen
    document.getElementById('game-over-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        movePacman(event.key);
    }
});

// Start the game
function startGame() {
    // Hide start screen and show game screen
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Initialize the game
    initializeBoard();
    gameInterval = setInterval(moveGhost, 500); // Ghost moves every 500ms
}

// Reset the game
function resetGame() {
    clearInterval(gameInterval);
    score = 0;
    lives = 3;
    document.getElementById('lives').textContent = lives;
    document.getElementById('current-score').textContent = score;
    
    // Show start screen and hide game screen
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
}

// Initialize when the page loads
window.onload = function() {
    // Add click event listener to start button
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Add click event listener to retry button
    document.querySelector('.retry-button').addEventListener('click', function() {
        document.getElementById('game-over-screen').style.display = 'none';
        resetGame();
    });
};