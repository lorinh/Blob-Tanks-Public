<template>
	<v-container>
		<canvas class="canvas"></canvas>
	</v-container>
</template>


<script>

	export default {
		name: "Game",
		data: () => ({}),
	}

	let settings = {
		clientPushRate: 100, //ms
		cameraFollowDistance: 100,
		canvasHeight: 900,
		canvasWidth: 1600,
		boardSizeX: 8000,
    	boardSizeY: 8000,
    	leaderLength: 5, //Number of players to show on leaderboard
		upKey:       87, // w
		upKeyAlt:    38, // Up Arrow
		downKey:     83, // s
		downKeyAlt:  40, // Down Arrow
		leftKey:     65, // a
		leftKeyAlt:  37, // Left Arrow
		rightKey:    68, // d
		rightKeyAlt: 39, // Right Arrow
		levelUp:     32, // Space bar
	}

	let images = {
	    blueBlob:         {src: require("../../images/BlueBlob.png")},
	    greyBlob:         {src: require("../../images/GreyBlob.png")},
	    redBlob:          {src: require("../../images/RedBlob.png")},
	    smallYellowBlob:  {src: require("../../images/SmallYellowBlob.png")},
	    mediumYellowBlob: {src: require("../../images/MediumYellowBlob.png")},

	    loaded: false,
	    imageCounter: 0,

	    init: async function() {

	    	let localImageCounter = 0;

	    	//Load all images in
	    	for (let image in this) {

	    		if (image != "loaded" && image != "init" && image != "callback" && image != "imageCounter") {

	    			localImageCounter += 1;
	    			let tempImage = new Image();
	    			this[image].img = tempImage;

	    			let self = this;
	    			tempImage.onload = function() {self.callback(self)};

	    			tempImage.src = this[image].src;
	    		}
	    	}

	    	//Wait for images to load
	    	while (this.imageCounter < localImageCounter) { 
	    		await sleep(100);
	    		console.log("waiting for images to load..." + this.imageCounter + " of " + localImageCounter);
	    	}
	    },

	    //Callback used for knowing when images are done loading
	    callback: function(self) {
	    	self.imageCounter += 1;
	    }
	}

	let screen = {

		init: async function() {

			while (this.canvas == null) {
				await sleep(100);
				this.canvas = document.querySelector(".canvas");
			}

			this.canvas.width = settings.canvasWidth;
			//this.canvas.height = settings.canvasHeight;
			this.canvas.height = "0px"

			this.context = this.canvas.getContext("2d");
			this.width = this.canvas.width;
			this.height = this.canvas.height;
		},

		clear: function() {
			this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height);
		},
	}

	let camera = {
		x: 0,
		y: 0,
		size: {x:1600,y:900},
		focusPos: {x:0,y:0},
	}

	let mouse = {
		x: 0,
		y: 0,
	}

	let customHeight = {
		custom: false,
		height: 0,
		proportion: 0,
	}


	// Designs of different levels of tanks
	let levelTanks = [
		[{img: 'blueBlob', dis: 0, rot: 0}], // Level 0
		[{img: 'blueBlob', dis: 0, rot: 0},  // Level 1
			{img: 'mediumYellowBlob', dis: 0, rot: 0}, 
			{img: 'smallYellowBlob', dis: 35, rot: 0}],
		[{img: 'blueBlob', dis: 0, rot: 0},  // Level 2
			{img: 'mediumYellowBlob', dis: 0, rot: 0}, 
			{img: 'smallYellowBlob', dis: 35, rot: 0}, 
			{img: 'smallYellowBlob', dis: 55, rot: 0}],
		[{img: 'blueBlob', dis: 0, rot: 0},  // Level 3
			{img: 'mediumYellowBlob', dis: 0, rot: 0}, 
			{img: 'smallYellowBlob', dis: 35, rot: 0}, 
			{img: 'smallYellowBlob', dis: 55, rot: 0},
			{img: 'smallYellowBlob', dis: 35, rot: Math.PI + Math.PI/8},
			{img: 'smallYellowBlob', dis: 35, rot: Math.PI - Math.PI/8}],
	]

	let keysDown = {};
	let playerID = "";
	let rotation = 0;

	//wait(ms)
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}



	//Drawing section

	//Main method of updaring the screen
	function updateScreen(data) {

		screen.clear()

		let localPlayer = data.players[playerID];
		calculateCamera(localPlayer);
		calculateRotation(localPlayer);

		drawBackground();
		drawBlobs(data);
		drawBullets(data.bullets);

		for (let key in data.players) {
			//screen.context.drawImage( images.blueBlob.img, data.players[key].x - camera.x, data.players[key].y - camera.y);
			drawPlayer(data.players[key].x, data.players[key].y, data.players[key].level, data.players[key].rotation, data.players[key].nickname);
		}

		drawScore(localPlayer);
		drawLeaderBoard(data);
	}

	//Draw each tank
	function drawPlayer(x, y, level, rotation, nickname) {
		let center = {x: 0, y: 0};

		for (let key in levelTanks[level]) {
			let design = levelTanks[level][key];

			if (center.x == 0 && center.y == 0) {
				center.x = images[design.img].img.naturalWidth / 2;
				center.y = images[design.img].img.naturalHeight / 2;
			}

			let blobPositionX = x + center.x +  Math.cos( rotation + design.rot ) * design.dis;
			let blobPositionY = y + center.y + Math.sin( rotation + design.rot ) * design.dis;

			drawImageFromCenter(images[design.img].img, blobPositionX, blobPositionY);
		}

		screen.context.fillStyle = "rgba(0,0,0,1)";
		screen.context.font = "18px Arial";
		screen.context.textAlign = "center"
		screen.context.fillText(nickname, x - camera.x + 51, y - 10 - camera.y);

	}

	//Draw bullets to the screen
	function drawBullets(bullets) {

		for (let bullet in bullets) {
			bullet = bullets[bullet];

			console.log("Drawing bullets");
			screen.context.drawImage( images.redBlob.img, bullet.x - camera.x, bullet.y - camera.y);
		}
	}

	//Draw image from center position coordinates
	function drawImageFromCenter(img, x, y) {
		x -= img.naturalWidth / 2;
		y -= img.naturalHeight / 2;

		screen.context.drawImage( img, x - camera.x, y - camera.y);
	}

	function drawLeaderBoard(data) {
		let playerCount = Object.keys( data.players ).length;

		if ( playerCount > settings.leaderLength ) {
			playerCount = settings.leaderLength;
		}

		let playersSorted = Object.entries(data.players)
		  	.map(entry => entry[1])
		    .sort((a, b) => b.score - a.score);

		//console.log("Player counted: " + playerCount);
		//console.log(playersSorted);

		screen.context.fillStyle = "#eeeeeeaa"

		screen.context.fillRect(1195, 5, 400, 25 * playerCount);

		screen.context.fillStyle = "rgba(0,0,0,1)";
		screen.context.font = "22px Balloons";
		screen.context.textAlign = "left"

		for (let index = 0; index < playerCount; index++) {
			screen.context.fillText(playersSorted[ index ].nickname + " " + playersSorted[ index ].score, 1200, 25 * index + 25);
		}

	}

	//Draws bottom bar and score
	function drawScore(localPlayer) {

		let yPosition = 800;

		//If screen is custom height, use it
		if (customHeight.custom) {
			yPosition *= customHeight.proportion;
		}

		//Draw shadow
		screen.context.fillStyle = "rgba(0,0,0,.1)";
		screen.context.fillRect(400 + 5,yPosition + 5,800,50);

		//Draw white background
		screen.context.fillStyle = "rgba(255,255,255,.9)";
		screen.context.fillRect(400,yPosition,800,50);

		let percentage = 0;

		if (localPlayer.levelScore < localPlayer.goalScore) {
			percentage = localPlayer.levelScore / localPlayer.goalScore;
		} else {
			percentage = 1;

			//Draw level box
			screen.context.fillRect(550,yPosition - 50,500,50);
		}

		//Choose progress bar color
		if (localPlayer.levelScore == localPlayer.maxScore) {
			screen.context.fillStyle = "rgba(162,23,27,1)";
		} else {
			screen.context.fillStyle = "rgba(100,181,245,1)";
		}

		//Draw progress bar
		screen.context.fillRect(400 + 4,yPosition + 4,(800-8) * percentage, 50 - 8)

		//Draw score
		screen.context.fillStyle = "rgba(0,0,0,1)";
		screen.context.font = "30px Balloons";
		screen.context.textAlign = "center"
		screen.context.fillText(localPlayer.levelScore, 800, yPosition + 37);

		//Draw level text
		if (localPlayer.levelScore >= localPlayer.goalScore) {
			screen.context.fillText("Press Space to level up", 800, yPosition - 23);
		}
	}

	//Draws the background
	function drawBackground() {

		screen.context.fillStyle = "#eeeeeeaa"

		//Draw out of bound areas
		screen.context.fillRect(0, 0, 0 - camera.x, settings.canvasHeight);
		screen.context.fillRect(0, 0, settings.canvasWidth, 0 - camera.y);
		screen.context.fillRect(settings.boardSizeX - camera.x, 0, settings.boardSizeX - camera.x + settings.boardSizeX, settings.canvasHeight);
		screen.context.fillRect(0, settings.boardSizeY - camera.y, settings.canvasWidth, settings.boardSizeY - camera.y + settings.boardSizeY);



		screen.context.strokeStyle = "#ddddddaa"

		for (let x = -1; x < settings.canvasWidth/100+1; x++) {
			for (let y = -1; y < settings.canvasHeight/100+1; y++) {
				screen.context.strokeRect(x * 100 - camera.x % 100, y * 100 - camera.y % 100, 100, 100);
			}
		}
	}

	//Draws blobs
	function drawBlobs(data) {
		for (let i = 0; i < data.blobs.length; i++) {
			if (data.blobs[i].visible) {
				screen.context.drawImage( images.greyBlob.img, data.blobs[i].x - camera.x , data.blobs[i].y - camera.y);
			}
		}
	}

	//Calculate camera position
	function calculateCamera(localPlayer) {

		camera.focusPos.x = localPlayer.x
		camera.focusPos.y = localPlayer.y;

		if (camera.x == 0 && camera.y == 0) {

			camera.x = -1 * localPlayer.x + camera.size.x/2;
			camera.y = -1 * localPlayer.y + camera.size.y/2;

		} else {

			//pythagorean theorem for distance
			let distance = Math.pow( camera.x + camera.size.x / 2 - localPlayer.x, 2 ) + Math.pow( camera.y + camera.size.y / 2 - localPlayer.y, 2 );
			distance = Math.pow( distance , .5 )

			if (distance > settings.cameraFollowDistance) {

				let xDif = camera.x + camera.size.x / 2 - localPlayer.x;
				let yDif = camera.y + camera.size.y / 2 - localPlayer.y;

				xDif = xDif / distance * settings.cameraFollowDistance;
				yDif = yDif / distance * settings.cameraFollowDistance;

				camera.x = localPlayer.x + xDif - camera.size.x / 2;
				camera.y = localPlayer.y + yDif - camera.size.y / 2;
			}
		}
	}

	//Calculate rotation of tank based on mouse and tank position
	function calculateRotation(localPlayer) {

		let x = localPlayer.x + 50 - ( mouse.x + camera.x ); 
		let y = localPlayer.y + 50 - ( mouse.y + camera.y );
		let z = Math.pow( Math.pow(x,2) + Math.pow(y,2), .5);

		rotation = Math.asin( y / z );
		if ( x > 0 ) {
			rotation = Math.PI - rotation; //TODO: Fix this for 0-6.28 instead of -1.5-4.6
		}

		rotation = rotation * -1;
	}

	function calculateHeight() {
		let maxHeight = document.querySelector(".container").offsetHeight;
		let estimateHeight = screen.canvas.offsetWidth / 1.7777;

		if (estimateHeight > maxHeight) {

			customHeight.proportion = maxHeight / estimateHeight;

			estimateHeight = maxHeight;

			customHeight.custom = true;
			customHeight.height = estimateHeight;

			screen.canvas.height = settings.canvasHeight * customHeight.proportion;
		} else {

			screen.canvas.height = settings.canvasHeight;

		}

		screen.canvas.style.height = estimateHeight + "px";

	}



	//Main method
	async function run() {


		//Setup
		await images.init();
		await screen.init();

		//screen.canvas.style.height = (screen.canvas.offsetWidth / 1.7777) + "px";
		calculateHeight();

		console.log("Finished loading screen")

		var socket = io("https://blobtanks.herokuapp.com");


		//Get Client ID
		socket.on("getPlayerID", function(data) {
			playerID = data;
			console.log("PlayerID is: " + playerID);
		});
		socket.emit("getPlayerID", getCookie("nickname"));

		console.log("Waiting for playerID...");
		while (playerID == "") {
			await sleep(100);
		}

		console.log("Finished loading!");

		//Add Key listeners
		document.addEventListener('keydown', function(event) {
			keysDown[event.keyCode] = true;

			if (event.keyCode == settings.levelUp) {
				socket.emit("levelUp");
			}
		});

		document.addEventListener('keyup', function(event) {
			keysDown[event.keyCode] = false;
		});

		screen.canvas.addEventListener('mousemove', function(event) {
			mouse.x = event.clientX / screen.canvas.offsetWidth  * settings.canvasWidth;
			mouse.y = event.clientY / screen.canvas.offsetHeight * settings.canvasHeight;
		});

		screen.canvas.addEventListener('mousedown', function(event) {

			mouse.x = event.clientX / screen.canvas.offsetWidth  * settings.canvasWidth;
			mouse.y = event.clientY / screen.canvas.offsetHeight * settings.canvasHeight;

			let bullet = {  xVel: camera.focusPos.x + 50 - ( mouse.x + camera.x ), 
							yVel: camera.focusPos.y + 50 - ( mouse.y + camera.y )};

			socket.emit("shoot", bullet);

		});


		//Drawing to screen
		socket.on("update", function(data) {
			updateScreen(data);
		});

		socket.on("kill", function() {
			console.log("Got kill event, sending home");

			//this.$router.push({ path: 'home' }); //This would be preferred, but I couldn't get it working
			window.location = "https://www.blobtanks.com/#/gameover"; // So we do this instead
		});

		//Input relayed to server
		while (true) {

			let packet = {
				xVel: 0,
				yVel: 0,
				xCamera: camera.x + camera.size.x / 2,
				yCamera: camera.y + camera.size.y / 2,
				rotation: rotation,
			}

			//Movement keys
			if ( keysDown[settings.rightKey] || keysDown[settings.rightKeyAlt]) {
				packet.xVel = 1;
			} else if ( keysDown[settings.leftKey] || keysDown[settings.leftKeyAlt]) {
				packet.xVel = -1;
			}
			if ( keysDown[settings.upKey] || keysDown[settings.upKeyAlt] ) {
				packet.yVel = -1;
			} else if ( keysDown[settings.downKey] || keysDown[settings.downKeyAlt] ) {
				packet.yVel = 1;
			}

			//Relay packet information to server
			socket.emit("playerUpdate", packet);

			await sleep(settings.clientPushRate);
		}
	}

	run()

</script>

<style>
	.canvas {
		width: 100%;
		margin: 0;
	}

	@font-face {
	    font-family: "Balloons";
	    src: url(../../fonts/Balloons.ttf) format("truetype");
	}

	.container {
		width: 100%;
		max-width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}
</style>
