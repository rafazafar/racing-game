class RacingGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.playerCar = document.getElementById('playerCar');
        this.obstaclesContainer = document.getElementById('obstacles');
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.gameOverDiv = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Touch control elements
        this.touchControls = document.getElementById('touchControls');
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');
        this.upBtn = document.getElementById('upBtn');
        this.downBtn = document.getElementById('downBtn');
        this.brakeBtn = document.getElementById('brakeBtn');

        this.gameWidth = this.gameArea.offsetWidth;
        this.gameHeight = this.gameArea.offsetHeight;
        this.carWidth = 40;
        this.carHeight = 80;

        this.playerPosition = {
            x: this.gameWidth / 2 - this.carWidth / 2,
            y: this.gameHeight - 130
        };

        this.obstacles = [];
        this.score = 0;
        this.speed = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.obstacleSpeed = 3;
        this.carSpeed = 5;

        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false
        };

        // Detect if device has touch capability
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTouchControls();
        this.updateCarPosition();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        window.addEventListener('resize', () => this.handleResize());
    }

    setupTouchControls() {
        if (this.isMobile) {
            this.touchControls.style.display = 'block';
        }

        // Left button
        this.leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.left = true;
        });
        this.leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.left = false;
        });

        // Right button
        this.rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.right = true;
        });
        this.rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.right = false;
        });

        // Up button
        this.upBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.up = true;
        });
        this.upBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.up = false;
        });

        // Down button
        this.downBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.down = true;
        });
        this.downBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.down = false;
        });

        // Brake button
        this.brakeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.space = true;
        });
        this.brakeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.space = false;
        });

        // Also add mouse events for desktop testing
        [this.leftBtn, this.rightBtn, this.upBtn, this.downBtn, this.brakeBtn].forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (btn === this.leftBtn) this.keys.left = true;
                if (btn === this.rightBtn) this.keys.right = true;
                if (btn === this.upBtn) this.keys.up = true;
                if (btn === this.downBtn) this.keys.down = true;
                if (btn === this.brakeBtn) this.keys.space = true;
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                if (btn === this.leftBtn) this.keys.left = false;
                if (btn === this.rightBtn) this.keys.right = false;
                if (btn === this.upBtn) this.keys.up = false;
                if (btn === this.downBtn) this.keys.down = false;
                if (btn === this.brakeBtn) this.keys.space = false;
            });
            
            btn.addEventListener('mouseleave', (e) => {
                if (btn === this.leftBtn) this.keys.left = false;
                if (btn === this.rightBtn) this.keys.right = false;
                if (btn === this.upBtn) this.keys.up = false;
                if (btn === this.downBtn) this.keys.down = false;
                if (btn === this.brakeBtn) this.keys.space = false;
            });
        });
    }

    handleKeyDown(e) {
        if (!this.gameRunning || this.gamePaused) return;

        switch(e.code) {
            case 'ArrowLeft':
                this.keys.left = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.keys.right = true;
                e.preventDefault();
                break;
            case 'ArrowUp':
                this.keys.up = true;
                e.preventDefault();
                break;
            case 'ArrowDown':
                this.keys.down = true;
                e.preventDefault();
                break;
            case 'Space':
                this.keys.space = true;
                e.preventDefault();
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.code) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case 'Space':
                this.keys.space = false;
                break;
        }
    }

    handleResize() {
        this.gameWidth = this.gameArea.offsetWidth;
        this.gameHeight = this.gameArea.offsetHeight;
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.speed = 0;
        this.obstacles = [];
        this.obstacleSpeed = 3;

        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        this.gameOverDiv.style.display = 'none';
        
        // Show touch controls during gameplay on mobile
        if (this.isMobile) {
            this.touchControls.style.display = 'block';
        }

        this.clearObstacles();
        this.resetPlayerPosition();
        this.gameLoop();
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pause';
    }

    restartGame() {
        this.startGame();
    }

    resetPlayerPosition() {
        this.playerPosition.x = this.gameWidth / 2 - this.carWidth / 2;
        this.playerPosition.y = this.gameHeight - 130;
        this.updateCarPosition();
    }

    updateCarPosition() {
        this.playerCar.style.left = this.playerPosition.x + 'px';
        this.playerCar.style.bottom = (this.gameHeight - this.playerPosition.y - this.carHeight) + 'px';
    }

    movePlayer() {
        if (this.keys.left && this.playerPosition.x > 0) {
            this.playerPosition.x -= this.carSpeed;
        }
        if (this.keys.right && this.playerPosition.x < this.gameWidth - this.carWidth) {
            this.playerPosition.x += this.carSpeed;
        }
        if (this.keys.up && this.playerPosition.y > 0) {
            this.playerPosition.y -= this.carSpeed;
        }
        if (this.keys.down && this.playerPosition.y < this.gameHeight - this.carHeight) {
            this.playerPosition.y += this.carSpeed;
        }

        this.updateCarPosition();
    }

    createObstacle() {
        const laneWidth = this.gameWidth / 4;
        const lane = Math.floor(Math.random() * 4);
        const x = lane * laneWidth + laneWidth / 2 - this.carWidth / 2;

        const obstacle = {
            x: x,
            y: -this.carHeight,
            element: document.createElement('div')
        };

        obstacle.element.className = 'obstacle';
        obstacle.element.style.left = obstacle.x + 'px';
        obstacle.element.style.top = obstacle.y + 'px';

        this.obstaclesContainer.appendChild(obstacle.element);
        this.obstacles.push(obstacle);
    }

    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.obstacleSpeed;
            obstacle.element.style.top = obstacle.y + 'px';

            if (obstacle.y > this.gameHeight) {
                obstacle.element.remove();
                this.obstacles.splice(i, 1);
                this.score += 10;
            }
        }
    }

    checkCollisions() {
        for (let obstacle of this.obstacles) {
            if (this.isColliding(this.playerPosition, obstacle)) {
                this.gameOver();
                return;
            }
        }
    }

    isColliding(player, obstacle) {
        return player.x < obstacle.x + this.carWidth &&
               player.x + this.carWidth > obstacle.x &&
               player.y < obstacle.y + this.carHeight &&
               player.y + this.carHeight > obstacle.y;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.speed = Math.floor(this.score / 100) * 10 + 20;
        this.speedElement.textContent = this.speed;

        this.obstacleSpeed = 3 + (this.score / 500);
    }

    clearObstacles() {
        this.obstacles.forEach(obstacle => obstacle.element.remove());
        this.obstacles = [];
    }

    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.gameOverDiv.style.display = 'block';
        this.finalScoreElement.textContent = this.score;

        this.clearObstacles();
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            this.movePlayer();
            this.updateObstacles();
            this.checkCollisions();
            this.updateScore();

            if (Math.random() < 0.02 + (this.score / 10000)) {
                this.createObstacle();
            }
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RacingGame();
});