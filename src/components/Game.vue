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
		//canvas = document.querySelector(".canvas");
		//this.canvas.width
		//this.canvas.height
		//this.canvas.fillStyle -- Color

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
			drawPlayer(data.players[key].x, data.players[key].y, data.players[key].level, data.players[key].rotation);
		}

		drawScore(localPlayer);
	}

	//Draw each tank
	function drawPlayer(x, y, level, rotation) {
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

	//Draws bottom bar and score
	function drawScore(localPlayer) {

		let yPosition = 800;

		if (customHeight.custom) {
			yPosition *= customHeight.proportion;
		}

		screen.context.fillStyle = "rgba(0,0,0,.1)";
		screen.context.fillRect(400 + 5,yPosition + 5,800,50);
		screen.context.fillStyle = "rgba(255,255,255,.9)";
		screen.context.fillRect(400,yPosition,800,50);

		let percentage = 0;

		if (localPlayer.levelScore < localPlayer.goalScore) {
			percentage = localPlayer.levelScore / localPlayer.goalScore;
		} else {
			percentage = 1;
			screen.context.fillRect(550,yPosition - 50,500,50);
		}

		if (localPlayer.levelScore == localPlayer.maxScore) {
			screen.context.fillStyle = "rgba(162,23,27,1)";
		} else {
			screen.context.fillStyle = "rgba(100,181,245,1)";
		}

		screen.context.fillRect(400 + 4,yPosition + 4,(800-8) * percentage, 50 - 8)

		screen.context.fillStyle = "rgba(0,0,0,1)";
		screen.context.font = "30px Balloons";
		screen.context.textAlign = "center"
		screen.context.fillText(localPlayer.levelScore, 800, yPosition + 37);

		if (localPlayer.levelScore >= localPlayer.goalScore) {
			screen.context.fillText("Press Space to level up", 800, yPosition - 23);
		}
	}

	//Draws the background
	function drawBackground() {
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

		let x = localPlayer.x + 50 - ( mouse.x + camera.x ); //TODO: Change 50 from magic number
		let y = localPlayer.y + 50 - ( mouse.y + camera.y ); //TODO: Change 50 from magic number
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

		var socket = io("https://blobtanks.herokuapp.com");


		//Get Client ID
		socket.on("getPlayerID", function(data) {
			playerID = data;
			console.log("PlayerID is: " + playerID);
		});
		socket.emit("getPlayerID", null);

		while (playerID == "") {
			await sleep(100);
		}


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
			//console.log(event.clientX / screen.canvas.offsetWidth * 1600, event.clientY / screen.canvas.offsetHeight * 900);
			mouse.x = event.clientX / screen.canvas.offsetWidth  * settings.canvasWidth;
			mouse.y = event.clientY / screen.canvas.offsetHeight * settings.canvasHeight;
		});

		screen.canvas.addEventListener('mousedown', function(event) {

			console.log("Mouse pressed");

			mouse.x = event.clientX / screen.canvas.offsetWidth  * settings.canvasWidth;
			mouse.y = event.clientY / screen.canvas.offsetHeight * settings.canvasHeight;

			let bullet = {  xVel: camera.focusPos.x + 50 - ( mouse.x + camera.x ), 
							yVel: camera.focusPos.y + 50 - ( mouse.y + camera.y )};

			socket.emit("shoot", bullet);

		});


		//Drawing to screen
		socket.on("update", function(data) {
			updateScreen(data);
		})

		socket.on("kill", function() {
			console.log("Got kill event, sending home");

			//this.$router.push({ path: 'home' }); //This would be preferred, but I couldn't get it working
			window.location = "https://www.blobtanks.com/#/gameover"; // So we do this instead
		})



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
