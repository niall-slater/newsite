var canvas = document.getElementById("Canvas_Catcher");
var ctx = canvas.getContext("2d");

var debugText = "";

var style = window.getComputedStyle(canvas);
var canvasScale = parseInt(style.getPropertyValue("width")) / 256;

var states = {menu:0, play:1, end:2, advance:3, pregame:4};
var state = states.menu;

var buttonTimer = 1;
var renderButton = false;

var resetTimer = 0;
var advanceTimer = 0;
var gameStartTimer = 0;

var currentSector = "ZESTLIFE";

var sectorNames = ["ZESTLIFE", "JOYZONE", "FUNDIRECTION", "BACKSTREETLADS", "V*SYNC", "JONASCOUSINS", "BOYZ-2-BOYZ"];
var sectorNumbers = ["16B", "12X", "19JO", "1D", "8BD", "69LOL", "420", "60HZ", "404", "123", "666"];

var boysThisSector = 0;

//debug disables asteroid collision and ramps up the speed to 15
var debug = false;


//Menu image
var menuReady = false;
var menuImage = new Image();
menuImage.onload = function ()
{
	menuReady = true;
};
menuImage.src = "title_screen.png";

//Button image
var buttonReady = false;
var buttonImage = new Image();
buttonImage.onload = function ()
{
	buttonReady = true;
};
buttonImage.src = "title_button.png";

//Rock Images
var rockReady = false;
var rockImage = new Image();
rockImage.onload = function ()
{
	rockReady = true;
};
rockImage.src = "img_rock.png";

var rock1Ready = false;
var rock1Image = new Image();
rock1Image.onload = function ()
{
	rock1Ready = true;
};
rock1Image.src = "img_rock1.png";

var rock2Ready = false;
var rock2Image = new Image();
rock2Image.onload = function ()
{
	rock2Ready = true;
};
rock2Image.src = "img_rock2.png";

var rockNeonReady = false;
var rockNeonImage = new Image();
rockNeonImage.onload = function ()
{
	rockNeonReady = true;
};
rockNeonImage.src = "img_rockNeon.png";



//Ship Image
var ship0Ready = false;
var ship0Image = new Image();
ship0Image.onload = function ()
{
	ship0Ready = true;
};
ship0Image.src = "img_ship_frame0.png";

var ship1Ready = false;
var ship1Image = new Image();
ship1Image.onload = function ()
{
	ship1Ready = true;
};
ship1Image.src = "img_ship_frame1.png";

var shipAnimTimer = 0;
var shipAnimInterval = 0.1;
var shipFrame2 = true;


//Boy Image
var boyReady = false;
var boyImage = new Image();
boyImage.onload = function ()
{
	boyReady = true;
};
boyImage.src = "img_boy.png";

//Stars Images
var stars_brightReady = false;
var stars_brightImage = new Image();
stars_brightImage.onload = function ()
{
	stars_brightReady = true;
};
stars_brightImage.src = "img_stars_bright.png";
var stars_dimReady = false;
var stars_dimImage = new Image();
stars_dimImage.onload = function ()
{
	stars_dimReady = true;
};
stars_dimImage.src = "img_stars_dim.png";


// GAME OBJECTS

var ship = {
    rescues: 0,
	losses: 0,
    width: ship0Image.width,
    height: ship0Image.height,
    x: 5,
    y: (canvas.height/2) - (ship0Image.height/2),
    speed: 64
};

var stars = {
    dimx: 0,
    brightx: 0,
	dimSpeed: 32,
	brightSpeed: 2
};

var startingDifficulty = 1.25;
var difficulty = startingDifficulty;
var difficultyAdvanceAmount = .25;
var difficultyAcceleration = 0.02;
var currentLevelDifficulty;

var num_Asteroids = 10;
var asteroids = [num_Asteroids];
var asteroid_Interval = 50;

var asteroidsNeon = [];

	
if (debug) {
    startingDifficulty = 15;
}
    

function Asteroid()
{
	this.sprite = getRandomRockImage();
    this.width = rockImage.width;
    this.height = rockImage.height;
    this.x = canvas.width + rockImage.width + Math.random() * asteroid_Interval;
    this.y = Math.random() * canvas.height;
    this.speed = 32 + ((Math.random()-0.5) * 30);
	this.wander = (Math.random() - 0.5) * 32/2;
	this.spin = (Math.random() - 0.5) * 20;
	this.rotation = ToRadians((Math.random() * 360));
}

var timerNeon;

function AsteroidNeon()
{
	this.sprite = rockNeonImage;
    this.width = rockNeonImage.width;
    this.height = rockNeonImage.height;
    this.x = 50 + (Math.random() * (canvas.width/2));
    this.y = -16;
    this.speed = 16 + ((Math.random()-0.5) * 30);
}


function getRandomRockImage() {
	var result = Math.random();
	
	if (result < 0.3)
		return rockImage;
	if (result >= 0.3 && result < 0.6)
		return rock1Image;
	if (result >= 0.6)
		return rock2Image;
}

var num_Boys = 10;
var boys = [num_Boys];
var boy_Interval = 100;

function Boy(x_modifier)
{
    this.width = boyImage.width;
    this.height = boyImage.height;
    this.x = canvas.width + boyImage.width + x_modifier;
    this.y = Math.random() * canvas.height;
    this.speed = 16;
}

// INITIALISATION

// Spawn asteroids
for (i = 0; i < num_Asteroids; i++) {
	asteroids[i] = new Asteroid();
}
timerNeon = 1;// Math.random()*10 + 5;

// Spawn boys
for (i = 0; i < num_Boys; i++) {
	boys[i] = new Boy(boy_Interval * i + Math.random() * 100 - 50);
}

window.onload = function() {
	
	var highscore = getCookie("highScore_catcher");
	
	if (highscore == null) {
		document.cookie = "highScore_catcher=" + 0 + ";expires=Wed, 1 Jan 2031 12:00:00 UTC";
		highscore = 0;
	}
	var holder = document.getElementById("HSDcatcher");
	holder.textContent = highscore + " Boys Picked Up";
}

// RESET GAME
var reset = function () {
    
    currentSector = sectorNames[Math.floor(Math.random()*sectorNames.length)] + " " + sectorNumbers[Math.floor(Math.random()*sectorNumbers.length)];
    
	for (i = 0; i < num_Asteroids; i++) {
		asteroids[i] = new Asteroid();
	}
	// Spawn boys
	for (i = 0; i < num_Boys; i++) {
		boys[i] = new Boy(boy_Interval * i + Math.random() * 100);
	}
	asteroidsNeon = [];
    
	ship.rescues = 0;
	ship.losses = 0;
	ship.x = 5;
	ship.y = (canvas.height/2) - (ship0Image.height/2);
	difficulty = startingDifficulty;
    currentLevelDifficulty = difficulty;
    
    boysThisSector = 0;
};

// ADVANCE GAME
var advanceDifficulty = function () {
    
    currentLevelDifficulty = currentLevelDifficulty + difficultyAdvanceAmount;
	
	ship.x = 5;
	ship.y = (canvas.height/2) - (ship0Image.height/2);
    
	for (i = 0; i < num_Asteroids; i++) {
		asteroids[i] = new Asteroid();
	}
	// Spawn boys
	for (i = 0; i < num_Boys; i++) {
		boys[i] = new Boy(boy_Interval * i + Math.random() * 100 - 50);
	}
	
	difficulty = currentLevelDifficulty;
	state = states.pregame;
    gameStartTimer = 2;
    
    timerNeon = Math.random()*10 + 5;
};


//INPUT HANDLERS

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

addEventListener("keyup", function (e) {
	
	delete keysDown[e.keyCode];
}, false);

//Handle touch controls

// Set up mouse events
var pressing = false;
var mousePos = { x:0, y:0 };
var lastPos = mousePos;

canvas.addEventListener("mousedown", function (e) {
        pressing = true;
        lastPos = getMousePos(canvas, e);
}, false);

canvas.addEventListener("mouseup", function (e) {
        pressing = false;
}, false);

canvas.addEventListener("mousemove", function (e) {
        mousePos = getMousePos(canvas, e);
}, false);

// Get the position of the mouse relative to the canvas
function getMousePos(canvasDom, mouseEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top
  };
}

//touch listener
canvas.addEventListener("touchstart", function (e) {
        mousePos = getTouchPos(canvas, e);
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchend", function (e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
	if (e.target == canvas) {
		e.preventDefault();
	}
  canvas.dispatchEvent(mouseEvent);
}, false);


// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}


//UPDATE FUNCTION
var update = function (modifier) {
	
	//update scaling in case window has been resized
	style = window.getComputedStyle(canvas);
	canvasScale = parseInt(style.getPropertyValue("width")) / 256;
	
	switch (state) {
        case states.menu:
            updateMenu(modifier);
            break;
		case states.play:
			updatePlay(modifier);
			break;
		case states.end:
			updateEnd(modifier);
			break;
		case states.advance:
			updateAdvance(modifier);
			break;
		case states.pregame:
			updatePregame(modifier);
			break;
		default:
			break;
	 }
};


var updateMenu = function(modifier) {
    
    if (buttonTimer > 0) {
        buttonTimer -= modifier;
    } else {
        buttonTimer = 1;
        renderButton = !renderButton;
    }
    
	if (pressing) {
        state = states.pregame;
        gameStartTimer = 2;
        reset();
	}
    
}

var updatePlay = function(modifier) {
	
	difficulty += modifier*difficultyAcceleration;
    
	//UPDATE INPUT
	
    if (37 in keysDown || 65 in keysDown) { // Player holding left or A
		ship.x -= modifier * ship.speed;
	}
	if (38 in keysDown || 87 in keysDown) { // Player holding up or W
		ship.y -= modifier * ship.speed;
	}
    if (39 in keysDown || 68 in keysDown) { // Player holding right or D
		ship.x += modifier * ship.speed;
	}
	if (40 in keysDown || 83 in keysDown) { // Player holding down or S
		ship.y += modifier * ship.speed;
	}
	if (32 in keysDown) { // Player holding space
		
	}
	
	if (pressing) {
		if (mousePos.x > ship.x * canvasScale)
			ship.x += modifier * ship.speed;
		if (mousePos.x < ship.x * canvasScale)
			ship.x -= modifier * ship.speed;
		if (mousePos.y > ship.y * canvasScale)
			ship.y += modifier * ship.speed;
		if (mousePos.y < ship.y * canvasScale)
			ship.y -= modifier * ship.speed;
        
	}
	
	//KEEP PLAYER WITHIN BOUNDS
	
	if (ship.x < 0) {ship.x = 0;}
	if (ship.x > canvas.width) {ship.x = canvas.width;}
	if (ship.y < 0) {ship.y = 0;}
	if (ship.y > canvas.height) {ship.y = canvas.height;}
	
	//UPDATE ROCKS
    
	for (i = 0; i < asteroids.length; i++) {
		asteroids[i].x -= modifier * asteroids[i].speed * difficulty;
		asteroids[i].y -= modifier * asteroids[i].wander * difficulty;
		asteroids[i].rotation += modifier * asteroids[i].spin;
		
		if (asteroids[i].x < -10 || asteroids[i].y < -10 ||  asteroids[i].y > canvas.height + 10 ) {
			asteroids[i] = new Asteroid();
			continue;
		}
		
        if (!debug) {
            if (Math.abs(asteroids[i].x - ship.x) < 8 && Math.abs(asteroids[i].y - ship.y) < 8) {
                //HIT
                resetTimer = 3;

                if (getCookie("highScore_catcher") != null) {
                    if (ship.rescues > parseInt(getCookie("highScore_catcher"))) {
                        document.cookie = "highScore_catcher=" + ship.rescues + ";expires=Wed, 1 Jan 2031 12:00:00 UTC";

                        //Updating the highscore live as below makes the game crash - getelementbyId returns null, probably because the element doesn't exist?

                        //var holder = document.getElementById("HSDcatcher");
                        //holder.textContent = highscore + " Boys Rescued";
                    }
                }

                state = states.end;
            }
        }
	}
    
    
    //Spawn neon rocks every so often)
    
    for (i = 0; i < asteroidsNeon.length; i++) {
        asteroidsNeon[i].x -= modifier * 124;
        asteroidsNeon[i].y += modifier * 124 * difficulty;
        
        if (!debug) {
            if (Math.abs(asteroidsNeon[i].x - ship.x) < 12 && Math.abs(asteroidsNeon[i].y - ship.y) < 12) {
                //HIT
                resetTimer = 3;

                if (getCookie("highScore_catcher") != null) {
                    if (ship.rescues > parseInt(getCookie("highScore_catcher"))) {
                        document.cookie = "highScore_catcher=" + ship.rescues + ";expires=Wed, 1 Jan 2031 12:00:00 UTC";

                        //Updating the highscore live as below makes the game crash - getelementbyId returns null, probably because the element doesn't exist?

                        //var holder = document.getElementById("HSDcatcher");
                        //holder.textContent = highscore + " Boys Rescued";
                    }
                }

                state = states.end;
            }
        }
    }
    
    if (timerNeon > 0) {
        timerNeon -= modifier;
    }
    else  {
        
        //Spawn neonrock!
	    asteroidsNeon[asteroidsNeon.length] = new AsteroidNeon();
        
        timerNeon = ((Math.random()*10)/difficulty) + 5;
    }
	
	//UPDATE BOYS
	
    var boysInPlay = boys.length;
    
	for (i = 0; i < boys.length; i++) {
		boys[i].x -= modifier * boys[i].speed * difficulty;
		
		//remove lost boys
		if (boys[i].x < -10 || boys[i].y < -10 ||  boys[i].y > canvas.height + 10 ) {
			boys.splice(i,1);
			ship.losses++;
            boysInPlay--;
			continue;
		}
        
        //remove rescued boys		
		if (Math.abs(boys[i].x - ship.x) < 8 && Math.abs(boys[i].y - ship.y) < 8) {
			//RESCUE
			boys.splice(i,1);
			ship.rescues++;
            boysThisSector++;
            boysInPlay--;
		}
	}
	

    //advance if all boys gone
    if (boysInPlay <= 0) {
        state = states.advance;
        advanceTimer = 3;
    }

	//UPDATE BACKGROUND STARS
	
	stars.brightx -= modifier * stars.brightSpeed * difficulty;
	stars.dimx -= modifier * stars.dimSpeed * difficulty;
	if (stars.brightx < - stars_brightImage.width) {
		stars.brightx = 0;
	}
	if (stars.dimx < - stars_dimImage.width) {
		stars.dimx = 0;
	}
    
    if (shipAnimTimer > 0) {
        shipAnimTimer -= modifier;
    }
    else {
        shipAnimTimer = shipAnimInterval;
        shipFrame2 = !shipFrame2;        
    }
};

var updateEnd = function(modifier) {
	
	if (resetTimer > 0)
		resetTimer -= modifier;
	else {
        state = states.pregame;
        gameStartTimer = 2;
		reset();
	}
	
};

var updateAdvance = function(modifier) {
	
	if (advanceTimer > 0) {
		advanceTimer -= modifier;
    }
	else {
		advanceDifficulty();
	}
	
};

var updatePregame = function(modifier) {
	
	if (gameStartTimer > 0) {
        gameStartTimer -= modifier;
    }
	else {
        state = states.play;
	}
    
    
	//UPDATE INPUT
	
    if (37 in keysDown || 65 in keysDown) { // Player holding left or A
		ship.x -= modifier * ship.speed;
	}
	if (38 in keysDown || 87 in keysDown) { // Player holding up or W
		ship.y -= modifier * ship.speed;
	}
    if (39 in keysDown || 68 in keysDown) { // Player holding right or D
		ship.x += modifier * ship.speed;
	}
	if (40 in keysDown || 83 in keysDown) { // Player holding down or S
		ship.y += modifier * ship.speed;
	}
	if (32 in keysDown) { // Player holding space
		
	}
	
	if (pressing) {
		if (mousePos.x > ship.x * canvasScale)
			ship.x += modifier * ship.speed;
		if (mousePos.x < ship.x * canvasScale)
			ship.x -= modifier * ship.speed;
		if (mousePos.y > ship.y * canvasScale)
			ship.y += modifier * ship.speed;
		if (mousePos.y < ship.y * canvasScale)
			ship.y -= modifier * ship.speed;
	}
	
	//KEEP PLAYER WITHIN BOUNDS
	
	if (ship.x < 0) {ship.x = 0;}
	if (ship.x > canvas.width) {ship.x = canvas.width;}
	if (ship.y < 0) {ship.y = 0;}
	if (ship.y > canvas.height) {ship.y = canvas.height;}

	//UPDATE BACKGROUND STARS
	
	stars.brightx -= modifier * stars.brightSpeed * difficulty;
	stars.dimx -= modifier * stars.dimSpeed * difficulty;
	if (stars.brightx < - stars_brightImage.width) {
		stars.brightx = 0;
	}
	if (stars.dimx < - stars_dimImage.width) {
		stars.dimx = 0;
	}
    
    if (shipAnimTimer > 0) {
        shipAnimTimer -= modifier;
    }
    else {
        shipAnimTimer = shipAnimInterval;
        shipFrame2 = !shipFrame2;
    }
	
};


// RENDER FUNCTION
var render = function () {
	
	ctx.clearRect(0,0, canvas.width,canvas.height);
	
	if (stars_dimReady) {
		ctx.drawImage(stars_dimImage, stars.dimx, 0);
		ctx.drawImage(stars_dimImage, stars.dimx + stars_dimImage.width, 0);
	}
	if (stars_brightReady) {
		ctx.drawImage(stars_brightImage, stars.brightx, 0);
		ctx.drawImage(stars_brightImage, stars.brightx + stars_brightImage.width, 0);
	}
	if (boyReady) {
		for (i = 0; i < boys.length; i++) {
			ctx.drawImage(boyImage, boys[i].x - boyImage.width/2, boys[i].y - boyImage.height/2);
		}
	}

	if (ship0Ready && ship1Ready) {
        if (shipFrame2) {
		  ctx.drawImage(ship1Image, ship.x - ship0Image.width/2, ship.y - ship0Image.height/2);
        }
        else {
		  ctx.drawImage(ship0Image, ship.x - ship0Image.width/2, ship.y - ship0Image.height/2);
        }
            
	}
	if (rockReady) {
		for (i = 0; i < asteroids.length; i++) {
			drawImageCenter(asteroids[i].sprite, asteroids[i].x, asteroids[i].y, 4, 4, 1, asteroids[i].rotation);
		}
	}
	
	if (rockNeonReady) {
		for (i = 0; i < asteroidsNeon.length; i++) {
			drawImageCenter(asteroidsNeon[i].sprite, asteroidsNeon[i].x, asteroidsNeon[i].y, 4, 4, 1);
		}
	}
	
	
	//RENDER UI
	switch (state) {
		case states.menu:
			renderMenu();
			break;
		case states.play:
			renderPlay();
			break;
		case states.end:
			renderEnd();
			break;
		case states.advance:
			renderAdvance();
			break;
		case states.pregame:
			renderPregame();
			break;
		default:
			break;
	 }
	
    if (debug) {
	   ctx.fillText("debug: " + debugText, canvas.width/2 -12, canvas.height - 14);
    }
};

var renderMenu = function () {
	ctx.clearRect(0,0, canvas.width,canvas.height);
    
    ctx.drawImage(menuImage, 0, 0); 
    
    if (renderButton)
        ctx.drawImage(buttonImage, 0, 0);
};

var renderPlay = function () {
	
	ctx.font = "17px sm";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff";
	ctx.fillText("BOYS PICKED UP: " + ship.rescues, 4, 4);
	ctx.fillText("BOYS GOT AWAY: " + ship.losses, 4, 114);
};

var renderEnd = function () {
	
	ctx.fillStyle = "rgba(0,0,0,0.6)";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
    var judgeText = "DON'T BEAT YOURSELF UP";
    
    if (boysThisSector > 0)
        judgeText = "YOU ONLY NEED ONE";
    if (boysThisSector > 1)
        judgeText = "TWO BOYS? NICE";
    if (boysThisSector > 2)
        judgeText = "THREE BOYS? OOOH";
    if (boysThisSector > 3)
        judgeText = "NICE PICKING";
    if (boysThisSector > 5)
        judgeText = "NOT BAD AT ALL";
    if (boysThisSector > 7)
        judgeText = "NICE PICKING";
    if (boysThisSector > 9)
        judgeText = "YOU BROUGHT ALL THE BOYS TO THE YARD";
    
	ctx.font = "17px sm";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#f33";
	ctx.fillText("GAME OVER. BOYS PICKED UP: " + boysThisSector, canvas.width/2, canvas.height/2 - 12);
    ctx.fillStyle = "#3f3";
	ctx.fillText(judgeText, canvas.width/2, canvas.height/2);
    ctx.fillStyle = "#f33";
	ctx.fillText("TOTAL BOYS: "  + ship.rescues, canvas.width/2, canvas.height/2 + 12);
	ctx.fillText("RESTARTING IN: " + Math.ceil(resetTimer), canvas.width/2, canvas.height/2 + 24);
};

var renderAdvance = function () {
	
	ctx.fillStyle = "rgba(0,0,0,0.6)";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	ctx.font = "17px sm";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#3f3";    
	ctx.fillText("SIGNAL LOST. BOYS PICKED UP: " + boysThisSector, canvas.width/2, canvas.height/2 - 12);
	ctx.fillText("TOTAL BOYS: "  + ship.rescues, canvas.width/2, canvas.height/2);
	ctx.fillText("JUMP TO NEXT SECTOR IN: " + Math.ceil(advanceTimer), canvas.width/2, canvas.height/2 + 12);
};

var renderPregame = function () {
		
	ctx.font = "17px sm";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#3f3";
	ctx.fillText("ARRIVED IN SECTOR: " + currentSector, canvas.width/2, canvas.height/2 - 8);
	ctx.fillText("BOYS DETECTED. LET'S GET 'EM.", canvas.width/2, canvas.height/2 + 8);
};


// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};


// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
//RUNGAME
main();


//UTILITY FUNCTIONS

function drawImageCenter(image, x, y, cx, cy, scale, rotation){
    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
    ctx.rotate(rotation);
    ctx.drawImage(image, -cx, -cy);
	ctx.resetTransform();
}

function ToRadians(deg)
{
	return deg * (Math.PI/180);
}

function ToDegrees(rad)
{
	return rad * (180/Math.PI);
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function goFullscreen() {
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;
	
}