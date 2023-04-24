const scoreEl = document.querySelectorAll(".score-num");
const result = document.querySelector(".result");
const startGameBtn = document.querySelector(".start-game-btn")

const canvas = document.querySelector(".canvas");

canvas.width = 700;
canvas.height = innerHeight;

const context = canvas.getContext("2d");

const spriteRunLeft = creatImage("images/spriteRunLeft.png");
const spriteRunRight = creatImage("images/spriteRunRight.png");
const spriteStandLeft = creatImage("images/spriteStandLeft.png");
const spriteStandRight = creatImage("images/spriteStandRight.png");

const platformImg = creatImage("images/platform.png");

let speed = 2;
let gravity = 0.5;

class Player{
    constructor() {
        this.scale = 0.7;
        this.image = spriteStandRight;
        this.width = 66 * this.scale;
        this.height = 150 * this.scale;

        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height - this.height - 50,
        }
        this.velocity = {
            x: 0,
            y: 0
        };
        
        this.frame = 0;
        this.sprite = {
            stand: {
                left: spriteStandLeft,
                right: spriteStandRight,
                cropWidth: 177,
                width: 66 * this.scale,
            },
            run: {
                left: spriteRunLeft,
                right: spriteRunRight,
                cropWidth: 341,
                width: 127.875 * this.scale,
            }
        }
        
        this.currentSprite = this.sprite.stand.right;
        this.currentCropWidth = this.sprite.stand.cropWidth;
    }

    draw() {
        context.beginPath();

        context.drawImage(
            this.currentSprite,
            this.currentCropWidth * this.frame,
            0,
            this.currentCropWidth,
            400,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );

        context.closePath();
    }

    update() {
        this.frame++;
        if (this.frame > 59 && (this.currentSprite === this.sprite.stand.right ||
            this.currentSprite === this.sprite.stand.left)) {
            this.frame = 0;
        } else if (this.frame > 29 && (this.currentSprite === this.sprite.run.right ||
            this.currentSprite === this.sprite.run.left)) {
            this.frame = 0;
        } else {
            
        }

        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        }
    }
}

class Platform{
    constructor({position , width}) {
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0
        }
        this.width = width;
        this.height = 60;
        this.image = platformImg;
    }

    draw() {
        context.beginPath();
        // context.fillStyle = "blue";
        // context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.drawImage(this.image, 0, 0, this.width, this.height,
            this.position.x, this.position.y, this.width, this.height);
        context.closePath();
    }

    update() {
        this.draw();
        // this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}


const widths = [100, 200, 250, 300, 350, 400];
let platforms = [];
let player;

const keys = {
    left: {
        pressed: false
    },
    right: {
        pressed: false
    },
    up: {
        pressed: false
    },
    down: {
        pressed: false
    }
}

let jump;
let parallax;
let lastPlatform;
let score;


function createPlatform(height){
    let randomWidth = Math.floor(Math.random() * widths.length);
    /// Position Limit from 0 to (canvas width - platform Width)
    let positionX = Math.floor(Math.random() * (canvas.width - widths[randomWidth]))
    platforms.push(new Platform({
        position: {
            x: positionX, y: canvas.height - (height) - 50,
        },width: widths[randomWidth]
    }));
}

function creatImage(imgSrc) {
    const img = new Image();
    img.src = imgSrc;
    return img;
}

function initGame() {
    jump = true;
    parallax = false;
    lastPlatform = 0;
    score = 0;

    player = new Player();

    platforms = [
        new Platform({
            position: {
                x: 0, y: canvas.height - 50,
            }, width: canvas.width
        }),
    ];
    
    for (let i = 1; i < 50; i++){
        createPlatform(i * 200);
    }


    animate();
}

let animateID;
function animate() {
    animateID = requestAnimationFrame(animate);
    context.clearRect(0, 0, canvas.width, canvas.height);
    player.update();

    platforms.forEach((platform, index) => {


        // Parallax Scroll Effect
        if (parallax && player.position.y < 50) {
            platform.velocity.y = speed + 2;
        } else if (parallax || player.position.y <= 200) {
            platform.velocity.y = speed;
            parallax = true;
        }
        
        /// Platform Collision Detection
        if (player.position.y + player.height <= platform.position.y
            && player.position.y + player.height + player.velocity.y >= platform.position.y
            && player.position.x + player.width >= platform.position.x
            && player.position.x <= platform.position.x + platform.width) {
            
            // Score Recorded
            if (index != lastPlatform) {
                score += 50;
                lastPlatform = index;
                scoreEl[0].innerHTML = score;

                if (index === 49) {
                    speed++;
                    gravity += 0.1;
                }
            }
            
            // Parallax Scroll Effect
            if (parallax) {
                player.velocity.y = speed;
            } else {
                player.velocity.y = 0;
            }

            jump = true;
        }

        // Delete Platform
        if (platform.position.y > canvas.height) {
            platform.position.y = canvas.height - (platforms.length) * 200 - 50;
        }

        platform.update();
    });
    

    /// If Player fall then Game Over
    if (player.position.y > canvas.height) {
        // console.log("You Lose");
        scoreEl[1].innerHTML = score;
        result.style.display = "block";
        cancelAnimationFrame(animateID);
    }


    if (keys.right.pressed && player.position.x + player.width < canvas.width) {
        player.velocity.x = speed * 2;
    } else if (keys.left.pressed && player.position.x > 0) {
        player.velocity.x = - speed * 2;
    } else {
        player.velocity.x = 0;
    }

    if(keys.up.pressed && jump === true) {
        player.velocity.y = -15;
        jump = false;
    }
}

startGameBtn.addEventListener("click", () => {
    result.style.display = "none";
    initGame();
});

addEventListener("keydown", (event) => {
    // console.log(event.key);
    switch (event.key) {
        case "ArrowUp":
        case "w":
        case " ":
            keys.up.pressed = true;
            break;
        case "ArrowDown":
        case "s":
            keys.down.pressed = true;
            break;
        case "ArrowLeft":
        case "d":
            player.currentSprite = player.sprite.run.left;
            player.currentCropWidth = player.sprite.run.cropWidth;
            player.width = player.sprite.run.width;
            keys.left.pressed = true;
            break;
        case "ArrowRight":
        case "a":
            player.currentSprite = player.sprite.run.right;
            player.currentCropWidth = player.sprite.run.cropWidth;
            player.width = player.sprite.run.width;
            keys.right.pressed = true;
            break;
    }
});

addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowUp":
        case "w":
        case " ":
            keys.up.pressed = false;
            break;
        case "ArrowDown":
        case "s":
            keys.down.pressed = false;
            break;
        case "ArrowLeft":
        case "d":
            player.currentSprite = player.sprite.stand.left;
            player.currentCropWidth = player.sprite.stand.cropWidth;
            player.width = player.sprite.stand.width;
            keys.left.pressed = false;
            break;
        case "ArrowRight":
        case "a":
            player.currentSprite = player.sprite.stand.right;
            player.currentCropWidth = player.sprite.stand.cropWidth;
            player.width = player.sprite.stand.width;
            keys.right.pressed = false;
            break;
    }
});