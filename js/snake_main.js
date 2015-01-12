// General Game Constants
var FPS = 6;
var timeOut = 1000/FPS * 0.2;
var KEY = {ESC:27, SPACE:32, LEFT:37, UP:38, RIGHT:39, DOWN:40};
var DIR = {UP: "up", DOWN: "down", LEFT: "left", RIGHT: "right"};

var SNAKE = {
	// Canvas Variables
	CANVAS_WIDTH: 800,
	CANVAS_HEIGHT: 800,
	RATIO:  null,
	scale: 1,
	
	// Timeout Variables
	dt: 0,
	dstep: 0.2,
	
	// Mobile Variables
	//offset: {top: 0, left: 0},
	currentWidth:  null,
	currentHeight:  null,
	canvas: null,
	ctx:  null,
	ua:  null,
	android: null,
	ios:  null,
	xDown: null,                                                       
	yDown: null,
	
	// Snake Variables
	SNAKE_DIM: 25,
	snakePos: [[225,200], [250,200], [275,200]], // Head First Left, [x,y]
	applePos: null,
	direction: DIR.LEFT,
	prevDirection: null,
	start: 0,
	last: new Date().getTime(),
	score: 0,
	applesEaten: 0,

	
	init: function(){
		this.RATIO = this.CANVAS_WIDTH / this.CANVAS_HEIGHT;
		this.currentWidth = this.CANVAS_WIDTH;
		this.currentHeight = this.CANVAS_HEIGHT;
		this.canvas = document.getElementsByTagName('canvas')[0];
		this.canvas.width = this.CANVAS_WIDTH;
		this.canvas.height = this.CANVAS_HEIGHT;
		this.ctx = this.canvas.getContext('2d');

		this.ua = navigator.userAgent.toLowerCase();
		this.android = this.ua.indexOf('android') > -1 ? true : false;
		this.ios = ( this.ua.indexOf('iphone') > -1 || this.ua.indexOf('ipad') > -1  ) ? true : false;
		this.ios = ( this.ua.indexOf('iphone') > -1 || this.ua.indexOf('ipad') > -1  ) ? true : false;

		window.addEventListener("keydown", this.checkKeyDown.bind(this), false);
		window.addEventListener("touchstart", this.handleTouchStart.bind(this), false);        
		window.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
		
		this.randomApplePos();
		this.resize();
		this.loop();
	},
	
	checkKeyDown: function(e){
		if(e.keyCode == KEY.LEFT && this.prevDirection != DIR.RIGHT){
			e.preventDefault();
			this.direction = DIR.LEFT;
		} else if(e.keyCode == KEY.RIGHT && this.prevDirection != DIR.LEFT) {
			e.preventDefault();
			this.direction = DIR.RIGHT;
		} else if(e.keyCode == KEY.UP && this.prevDirection != DIR.DOWN) {
			e.preventDefault();
			this.direction = DIR.UP;
		} else if(e.keyCode == KEY.DOWN && this.prevDirection != DIR.UP) {
			e.preventDefault();
			this.direction = DIR.DOWN;
		} 	
	},
	                                                        

 	handleTouchStart: function(evt) {   
 		evt.preventDefault();                                      
	    xDown = evt.touches[0].clientX;                                      
	    yDown = evt.touches[0].clientY;                                      
	},                                            

	handleTouchMove: function(evt) {
		evt.preventDefault();

	    if (!xDown || !yDown) {
	        return;
	    }

	    var xUp = evt.touches[0].clientX;                                    
	    var yUp = evt.touches[0].clientY;

	    var xDiff = xDown - xUp;
	    var yDiff = yDown - yUp;

	    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
	        if ( xDiff > 0 && this.prevDirection != DIR.RIGHT) {
	            /* left swipe */ 
				this.direction = DIR.LEFT;
	        } else if(this.prevDirection != DIR.LEFT){
	            /* right swipe */
	            this.direction = DIR.RIGHT;
	        }                       
	    } else {
	        if (yDiff > 0 && this.prevDirection != DIR.DOWN) {
	            /* up swipe */ 
	            this.direction = DIR.UP;
	        } else if(this.prevDirection != DIR.UP){ 
	            /* down swipe */
	            this.direction = DIR.DOWN;
	        }                                                                 
	    }
	    /* reset values */
	    xDown = null;
	    yDown = null;                                             
	},

	resize: function() {
		this.currentHeight = window.innerHeight;
		this.currentWidth = this.currentHeight * this.RATIO;

		if (this.android || this.ios) {
			document.body.style.height = (window.innerHeight + 50) + 'px';
		}

		if(window.innerHeight > window.innerWidth){
			this.currentHeight = window.innerWidth;
			this.currentWidth = window.innerWidth;
		}

		this.canvas.style.width = this.currentWidth + 'px';
		this.canvas.style.height = this.currentHeight + 'px';

		// this.scale = this.currentWidth / this.CANVAS_WIDTH;
		// this.offset.top = this.canvas.offsetTop;
		// this.offset.left = this.canvas.offsetLeft;

		window.setTimeout(function() {
			window.scrollTo(0,1);
		}, 1);
	},
	
	timestamp: function () { 
		return new Date().getTime(); 
	},
	
	loop: function() {
		this.start = this.timestamp();
		this.update((this.start-this.last)/1000.0);
		this.render();
		this.last = this.start;
		if(this.edgeCollision() || this.bodyCollision()){
			this.gameOver();
		} else {
			setTimeout(this.loop.bind(this), timeOut);
		}
	},
	
	update: function(idt) {
		this.dt += idt;
		while(this.dt > this.dstep){
			this.dt -=  this.dstep
			
			var nextPos = this.snakePos[0].slice();

			switch(this.direction){
				case DIR.LEFT:
					nextPos[0] -= this.SNAKE_DIM;
					break
				case DIR.RIGHT:
					nextPos[0] += this.SNAKE_DIM;
					break
				case DIR.UP:
					nextPos[1] -= this.SNAKE_DIM;
					break
				case DIR.DOWN:
					nextPos[1] += this.SNAKE_DIM;
					break	
			}
	
			this.prevDirection = this.direction;
			this.snakePos.unshift(nextPos);
			this.snakePos.pop();

			if(this.appleCollision()){
				do{
					this.randomApplePos();
				} while(!this.posAvailable());

				this.dstep *= 0.99;
				this.score += this.snakePos.length;
				var scoreInt = parseInt(this.score);
				document.getElementById("score").innerHTML = "Score: " + this.score;
				this.applesEaten++;
				document.getElementById("apples").innerHTML = "Apples: " + this.applesEaten;
				this.increaseBody();
			}
		}
	},
	
	increaseBody: function(){
	var incPos = this.snakePos[this.snakePos.length - 1].slice();
		switch(this.direction){
		case DIR.LEFT:
			incPos[0] += this.SNAKE_DIM;
			break
		case DIR.RIGHT:
			incPos[0] -= this.SNAKE_DIM;
			break
		case DIR.UP:
			incPos[1] += this.SNAKE_DIM;
			break
		case DIR.DOWN:
			incPos[1] -= this.SNAKE_DIM;
			break	
		}
		this.snakePos.push(incPos);
	},

	render: function() {
		this.Draw.clear();
		this.Draw.roundedRect(this.applePos.left, this.applePos.top, 22, 22, 11, "white");
		for(var i = 0; i < this.snakePos.length; i++){
			this.drawBodySection(this.snakePos[i]);
		}
	},
	
	drawBodySection: function(section){
		// section will be [left, top]
		this.Draw.rect(section[0], section[1], this.SNAKE_DIM, this.SNAKE_DIM, "black");
	},
	
	gameOver: function(){
		this.Draw.clear();
		var end = "Game Over";
		var metrics = this.ctx.measureText(end);
		this.Draw.text(end, this.CANVAS_WIDTH/2 - metrics.width*2, this.CANVAS_HEIGHT/2, 50, 'white');
		// this.Draw.text("Score: " + this.score, this.CANVAS_WIDTH/2 - metrics.width*3, this.CANVAS_HEIGHT/2 + 55, 46, 'black');
		// this.Draw.text("Apples Eaten: " + this.applesEaten, this.CANVAS_WIDTH/2 - metrics.width*3, this.CANVAS_HEIGHT/2 + 110, 46, 'black');

	},
	
	edgeCollision: function(){
		return (this.snakePos[0][0] < 0 
				|| this.snakePos[0][0] > (this.CANVAS_WIDTH - this.SNAKE_DIM)
				|| this.snakePos[0][1] < 0
				|| this.snakePos[0][1] > (this.CANVAS_HEIGHT - this.SNAKE_DIM));
	},
	
	appleCollision: function(){
		return (this.snakePos[0][0] == this.applePos.left) && (this.snakePos[0][1] == this.applePos.top);
	},

	bodyCollision: function(){
		for(var i = 1; i < this.snakePos.length; i++){
			if(this.snakePos[i][0] == this.snakePos[0][0] && this.snakePos[i][1] == this.snakePos[0][1]){
				return true;
			}
		}
	},
	
	randomApplePos: function(){
		this.applePos = {top: Math.floor(Math.random()* this.CANVAS_WIDTH/this.SNAKE_DIM)*25, 
						 left: Math.floor(Math.random()* this.CANVAS_WIDTH/this.SNAKE_DIM)*25};
	},

	posAvailable: function(){
		for(var i = 0; i < this.snakePos.length; i++){
			if(this.applePos.left == this.snakePos[i][0] && this.applePos.top == this.snakePos[i][1]){
				return false;
			}
		}
		return true;
	}
}

SNAKE.Draw = {

	clear: function() {
		SNAKE.ctx.clearRect(0, 0, SNAKE.CANVAS_WIDTH, SNAKE.CANVAS_HEIGHT);
	},


	rect: function(x, y, w, h, col) {
		SNAKE.ctx.fillStyle = col;
		SNAKE.ctx.fillRect(x, y, w, h);
	},

	circle: function(x, y, r, col) {
		SNAKE.ctx.fillStyle = col;
		SNAKE.ctx.beginPath();
		SNAKE.ctx.arc(x + 5, y + 5, r, 0,  Math.PI * 2, true);
		SNAKE.ctx.closePath();
		SNAKE.ctx.fill();
	},


	text: function(string, x, y, size, col) {
		SNAKE.ctx.font = 'bold '+ size +'px BebasNeueLight';
		SNAKE.ctx.fillStyle = col;
		SNAKE.ctx.fillText(string, x, y);
	},

	roundedRect: function(x,y,width,height,radius,col){
		SNAKE.ctx.fillStyle = col;
		SNAKE.ctx.strokeStyle = "white";
		SNAKE.ctx.beginPath();
		SNAKE.ctx.moveTo(x,y+radius);
		SNAKE.ctx.lineTo(x,y+height-radius);
		SNAKE.ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
		SNAKE.ctx.lineTo(x+width-radius,y+height);
		SNAKE.ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
		SNAKE.ctx.lineTo(x+width,y+radius);
		SNAKE.ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
		SNAKE.ctx.lineTo(x+radius,y);
		SNAKE.ctx.quadraticCurveTo(x,y,x,y+radius);
		SNAKE.ctx.fill();
		SNAKE.ctx.stroke();
	}

};

window.addEventListener('load', function(){SNAKE.init();}, false);
window.addEventListener('resize', function() {SNAKE.resize();}, false);
document.getElementById("replay").addEventListener('click', function(){location.reload();});