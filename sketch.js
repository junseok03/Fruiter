var gameChar_world_x;
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var trees_x;
var treePos_y;
var canyons;
var collectables;

var game_score;
var flagpole;
var lives;
var livesColor;

var platforms;
var enemies;

var jumpSound;
var collectableSound;
var plummetingSound;
var game_completeSound;
var woohooSound;

function preload()
{
    soundFormats('mp3','wav');
    
    //load sounds
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    collectableSound = loadSound('assets/collectable.wav');
    collectableSound.setVolume(0.1);
    plummetingSound = loadSound('assets/plummeting.wav');
    plummetingSound.setVolume(0.1);
    game_completeSound = loadSound('assets/game_complete.wav');
    game_completeSound.setVolume(0.1);
    gameBackgroundSound = loadSound('assets/gameBackground.mp3');
    gameBackgroundSound.setVolume(0.1);
    woohooSound = loadSound('assets/woohoo.wav');
    woohooSound.setVolume(0.1);
    
}

function setup()
{
	createCanvas(1024, 576);
    push();
    gameBackgroundSound.play();
    pop();

    floorPos_y = height * 3/4;
    lives = 4;
    livesColor = ["red", "orange", "lime"];
    
    startGame();
}

function startGame()
{
    lives -= 1;
    gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Setup for background scrolling and real position
	scrollPos = 0;
	gameChar_world_x = gameChar_x - scrollPos;

	// Setup for the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Arrays for scenery objects.
    collectables = [
        {x_pos: 165, y_pos: floorPos_y - 12, size: 35, isFound: false},
        {x_pos: 680, y_pos: floorPos_y - 125, size: 35, isFound: false},
        {x_pos: 980, y_pos: floorPos_y - 12, size: 35, isFound: false},
        {x_pos: 1250, y_pos: floorPos_y - 12, size: 35, isFound: false},
        {x_pos: 1305, y_pos: floorPos_y - 325, size: 35, isFound: false}
    ];
    
    canyons = [
        {x_pos: 0, width: 100},
        {x_pos: 400, width: 100},
        {x_pos: 900, width: 100}
    ]
    
    trees_x = [100, 500, 730, 900, 1300, 1500];
    treePos_y = floorPos_y - 52;
    
    clouds = [
        {x_pos: 200, y_pos: 150},
        {x_pos: 510, y_pos: 100},
        {x_pos: 800, y_pos: 180},
        {x_pos: 1080, y_pos: 80}
    ];
    
    mountains = [
        {x_pos: 440, y_pos: floorPos_y},
        {x_pos: 720, y_pos: floorPos_y},
        {x_pos: 1000, y_pos: floorPos_y}
    ]
    
    platforms = [];
    
    platforms.push(createPlatforms(540, floorPos_y - 100, 180));
    platforms.push(createPlatforms(150, floorPos_y - 100, 230));
    platforms.push(createPlatforms(1400, floorPos_y - 100, 80));
    platforms.push(createPlatforms(1350, floorPos_y - 200, 100));
    platforms.push(createPlatforms(1200, floorPos_y - 300, 220));
    
    game_score = 0;
    flagpole = {isReached: false, x_pos: 1600};
    
    enemies = [];
    enemies.push(new Enemy(150, floorPos_y - 120, 230));
    enemies.push(new Enemy(540, floorPos_y - 120, 180));
    enemies.push(new Enemy(900, floorPos_y - 20, 180));
    enemies.push(new Enemy(1200, floorPos_y - 320, 220));
}

function draw()
{
	background(100, 155, 255);

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4);
    
    push();
    translate(scrollPos, 0);

	// Draw clouds.
    drawClouds();

	// Draw mountains.
    drawMountains();

	// Draw trees.
    drawTrees();
    
    // Draw platforms
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }

	// Draw canyons.
    for(var i = 0; i < canyons.length; i++)
    {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }

	// Draw collectable items.
    for(var i = 0; i < collectables.length; i++)
    {
        if(!collectables[i].isFound)
        {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        }
    }
    
    renderFlagpole();
    
    for(var i = 0; i < enemies.length; i++)
        {
            enemies[i].draw();
            
            var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
            if(isContact)
                {
                    plummetingSound.play();
                    if(lives>0)
                        {
                            startGame();
                            break;
                        }
                }
        }
    
    pop();

	// Draw game character.
	drawGameChar();
    
    //Show score.
    fill(255);
    noStroke();
    textSize(18);
    text("score: " + game_score + "/5", 20, 30);
    
    //Show lives.
    checkPlayerDie();
    noStroke();
    textSize(18);
    text("lives: ", 20, 50);
    for(var i = 0; i < lives; i++)
        {
            push();
            fill(livesColor[i]);
            ellipse(80 + i * 20, 45, 12);
            pop();
        }
    
    //Show "Game over" and "Level complete" text.
    if(lives < 1)
        {
            gameBackgroundSound.stop();
            text("GAME OVER", width/2 - 50, height/2);
            isFalling = true;
            return;
        }
    else if(flagpole.isReached)
        {
            text("LEVEL COMPLETE", width/2 - 125, height/2);
            isFalling = true;
            return;
        }
    

	// Make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 4;
		}
		else
		{
			scrollPos += 4;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 4;
		}
		else
		{
			scrollPos -= 4;
		}
	}

	// Make the game character rise and fall.
    if(gameChar_y < floorPos_y)
        {
            var isContact = false;
            for(var i = 0; i < platforms.length; i++)
                {
                    if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
                        {
                            isContact = true;
                            isFalling = false;
                            console.log("isConnected");
                            break;
                        }
                }
            if(isContact == false)
                {
                    isFalling = true;
                    gameChar_y += 3;
                }
        }
        else
            {
                isFalling = false;
            }

    if(isPlummeting == true)
        {
            gameChar_y += 10;
            isLeft = false;
            isRight = false;
            isFalling = false;
        }
    if(!flagpole.isReached)
        {
            checkFlagpole();
        }

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}

// Key control functions
function keyPressed(){

	console.log("press" + keyCode);
	console.log("press" + key);

    if(keyCode == 65 || key == "a")
        {
            console.log("Go Left!");
            isLeft = true;
        }
    if(keyCode == 68 || key == "d")
        {
            console.log("Go Right!");
            isRight = true;
        }
    //Make the character jumpable & MAKE SURE TO PREVENT DOUBLE JUMP
    if((keyCode == 87 || key == "w") && isFalling == false)
        {
            console.log("Jump!");
            gameChar_y -= 100;
            jumpSound.play();
        }
}

function keyReleased()
{

	console.log("release" + keyCode);
	console.log("release" + key);
    
    if(keyCode == 65 || key == "a")
        {
            console.log("Go Left END");
            isLeft = false;
        }
    else if(keyCode == 68 || key == "d")
        {
            console.log("Go Right END");
            isRight = false;
        }

}

// Function to draw the game character.
function drawGameChar()
{
	// draw game character
    if(isLeft && isFalling)
	{
		// jumping-left code
        strokeWeight(2);
        stroke(0);
        fill(120);
        rect(gameChar_x - 10, gameChar_y - 70, 20, 20)
        fill(255, 100, 100);
        rect(gameChar_x - 7, gameChar_y - 50, 14, 25);
        stroke(0);
        rect(gameChar_x - 20, gameChar_y - 50, 30, 7);
        fill(70, 70, 255);
        rect(gameChar_x - 19, gameChar_y - 25, 18, 7);
        rect(gameChar_x + 1, gameChar_y - 25, 18, 7);
	}
	else if(isRight && isFalling)
	{
		// jumping-right code
        strokeWeight(2);
        stroke(0);
        fill(120);
        rect(gameChar_x - 10, gameChar_y - 70, 20, 20)
        fill(255, 100, 100);
        rect(gameChar_x - 7, gameChar_y - 50, 14, 25);
        stroke(0);
        rect(gameChar_x - 10, gameChar_y - 50, 30, 7);
        fill(70, 70, 255);
        rect(gameChar_x - 19, gameChar_y - 25, 18, 7);
        rect(gameChar_x + 1, gameChar_y - 25, 18, 7);
	}
	else if(isLeft)
	{
		// walking left code
        strokeWeight(2);
        stroke(0);
        fill(120);
        rect(gameChar_x - 10, gameChar_y - 70, 20, 20)
        fill(255, 100, 100);
        rect(gameChar_x - 7, gameChar_y - 50, 14, 25);
        stroke(0);
        rect(gameChar_x - 20, gameChar_y - 50, 30, 7);
        fill(70, 70, 255);
        rect(gameChar_x - 19, gameChar_y - 25, 24, 7);
        rect(gameChar_x + 1, gameChar_y - 25, 6, 25);
	}
	else if(isRight)
	{
		// walking right code
        strokeWeight(2);
        stroke(0);
        fill(120);
        rect(gameChar_x - 10, gameChar_y - 70, 20, 20)
        fill(255, 100, 100);
        rect(gameChar_x - 7, gameChar_y - 50, 14, 25);
        stroke(0);
        rect(gameChar_x - 10, gameChar_y - 50, 30, 7);
        fill(70, 70, 255);
        rect(gameChar_x - 7, gameChar_y - 25, 6, 25);
        rect(gameChar_x - 7, gameChar_y - 25, 24, 7);
	}
	else if(isFalling || isPlummeting)
	{
		// jumping facing forwards code
        strokeWeight(2);
        stroke(0);
        fill(120);
        rect(gameChar_x - 10, gameChar_y - 70, 20, 20)
        fill(255, 100, 100);
        rect(gameChar_x - 7, gameChar_y - 50, 14, 25);
        rect(gameChar_x- 20, gameChar_y - 50, 40, 7);
        fill(70, 70, 255);
        rect(gameChar_x - 19, gameChar_y - 25, 18, 7);
        rect(gameChar_x + 1, gameChar_y - 25, 18, 7);
        stroke(0);
        fill(255, 0 , 0);
        rect(gameChar_x - 2, gameChar_y - 50, 4, 8);
	}
	else
	{
		// standing front facing code
        strokeWeight(2);
        stroke(0);
        fill(120);
        rect(gameChar_x - 10, gameChar_y - 70, 20, 20)
        fill(255, 100, 100);
        rect(gameChar_x - 7, gameChar_y - 50, 14, 25);
        rect(gameChar_x- 12, gameChar_y - 50, 24, 20);
        fill(70, 70, 255);
        rect(gameChar_x - 7, gameChar_y - 25, 6, 25);
        rect(gameChar_x + 1, gameChar_y - 25, 6, 25);
        stroke(0);
        fill(255, 0 , 0);
        rect(gameChar_x - 2, gameChar_y - 50, 4, 8);
	}
}

// Background
// Function to draw cloud objects.
function drawClouds()
{
    for (i = 0; i < clouds.length; i++)
    {
        fill(255);
        ellipse(clouds[i].x_pos, clouds[i].y_pos, 80, 80);
        ellipse(clouds[i].x_pos - 40, clouds[i].y_pos, 60, 60);
        ellipse(clouds[i].x_pos + 40, clouds[i].y_pos, 60, 60);
    }
}

// Function to draw mountains objects.
function drawMountains()
{
    for(i = 0; i < mountains.length; i++)
    {
        noStroke();
        fill(119,136,153,180);
        triangle(mountains[i].x_pos - 100, mountains[i].y_pos, 
                 mountains[i].x_pos, mountains[i].y_pos - 182,
                 mountains[i].x_pos + 100, mountains[i].y_pos);
    }
}

// Function to draw trees objects.
function drawTrees()
{
    for(i = 0; i < trees_x.length; i++){
        noStroke();
        fill(128, 0, 0);
        rect(trees_x[i], treePos_y, 26, 52);
        fill(144,238,144);
        triangle(trees_x[i] - 25, treePos_y + 20, 
                 trees_x[i] + 51, treePos_y + 20,
                 trees_x[i] + 13, treePos_y - 20);
        triangle(trees_x[i] - 15, treePos_y, 
                 trees_x[i] + 41, treePos_y, 
                 trees_x[i] + 13, treePos_y - 40);
        strokeWeight(10);
        stroke(255, 0, 0);
        point(trees_x[i] + 3, treePos_y + 5);
        stroke(255, 140, 0);
        point(trees_x[i] + 19, treePos_y-12);
    }
}

// Function to draw canyon objects.
function drawCanyon(t_canyon)
{
    noStroke();
    fill(139,69,19);
    rect(t_canyon.x_pos + 1.95 * t_canyon.width, floorPos_y, t_canyon.width * 0.9, floorPos_y + 88);
    fill(233, 150, 122);
    rect(t_canyon.x_pos + 2.3 * t_canyon.width, floorPos_y, t_canyon.width * 0.2, floorPos_y + 88);
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
    if(gameChar_world_x > t_canyon.x_pos + 1.95 * t_canyon.width && gameChar_world_x < t_canyon.x_pos + 1.95 * t_canyon.width + t_canyon.width * 0.9 && gameChar_y >= floorPos_y)
        {
            isPlummeting = true;
        }
}

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
    for(var i = 0; i < collectables.length; i++)
    {
        if(t_collectable.isFound == false)
        {
            //ORANGE
            strokeWeight(t_collectable.size);
            stroke(255, 140, 0);
            point(t_collectable.x_pos - 14, t_collectable.y_pos);
            strokeWeight(2);
            stroke(0);
            line(t_collectable.x_pos -14, t_collectable.y_pos - 10, t_collectable.x_pos - 14, t_collectable.y_pos - 30);
            
            //APPLE
            strokeWeight(t_collectable.size);
            stroke(255, 0, 0);
            point(t_collectable.x_pos + 14, t_collectable.y_pos);
            strokeWeight(2);
            stroke(0);
            line(t_collectable.x_pos + 14, t_collectable.y_pos -10, t_collectable.x_pos + 14, t_collectable.y_pos - 30);
        }
    }
}

// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
    if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) <= 35)
        {
            t_collectable.isFound = true;
            game_score += 1;
            collectableSound.play();
        }
}

// Function to render a flagpole.
function renderFlagpole()
{
    push();
    stroke(0);
    strokeWeight(5);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 380);
    fill(255, 0, 0);
    
    if(flagpole.isReached)
        {
            fill(0, 255, 0);
            triangle(flagpole.x_pos, floorPos_y - 380,
                     flagpole.x_pos + 30, floorPos_y - 365,
                     flagpole.x_pos, floorPos_y - 300);
            noFill();
        }
    else
        {
            triangle(flagpole.x_pos, floorPos_y - 30,
                     flagpole.x_pos + 30, floorPos_y - 15,
                     flagpole.x_pos, floorPos_y)
        }
    
    pop();
}

// Function to check character has reached the flagpole.
function checkFlagpole()
{
    var d = abs(gameChar_world_x - flagpole.x_pos);
    
    if(d < 15)
        {
            gameBackgroundSound.stop();
            woohooSound.play();
            game_completeSound.play();
            flagpole.isReached = true;
        }
}

// Function to check has dead
function checkPlayerDie()
{
    if(gameChar_y > height)
        {   
            plummetingSound.play();
            if(lives > 0)
                {
                    startGame();
                }
            else if(lives = 0)
                {
                    lives = 0;
                }
        }
}

// Function to create platforms.
function createPlatforms(x, y, length)
{
    var p = {
        x: x,
        y: y,
        length: length,
        
        draw: function()
        {
            fill(128, 0, 0);
            rect(this.x, this.y, this.length, 20);
        },
        
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
                {
                    var d = gc_y - this.y;
                    if(d >= 0 && d < 10)
                        {
                            return true;
                        }
                }
            return false;
        }
    }
    
    return p;
}

// Function to draw and animate the enemies.
function Enemy(x, y, range)
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = 1;
    
    this.update = function()
    {
        this.currentX += this.inc;
        
        if(this.currentX >= this.x + this.range)
            {
                this.inc = -1;
            }
        else if(this.currentX < this.x)
            {
                this.inc = 1;
            }
    };
    
    this.draw = function()
    {
        this.update();
        fill(0);
        ellipse(this.currentX, this.y, 15);
        line(this.currentX, this.y, this.currentX, this.y + 15);
        line(this.currentX, this.y, this.currentX - 15, this.y + 15);
        line(this.currentX, this.y, this.currentX + 15, this.y + 15);
        fill(255, 255, 255);
        ellipse(this.currentX - 5, this.y, 7);
        ellipse(this.currentX + 5, this.y, 7);
    };
    
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(this.currentX, this.y, gc_x, gc_y);
        
        if(d < 25)
            {
               return true; 
            }
        return false;
    }
}