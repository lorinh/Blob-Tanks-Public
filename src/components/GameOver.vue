<template >
  <v-container>
  	<v-container class="background">
 	</v-container>

  	<v-container class="titleContainer">
  		<v-img :src="images.mainLogo" aspect-ratio="5.8" width="800px" class="titleContainer"></v-img>
 	</v-container>
  	<v-window class="elevation-4 grey lighten-5" v-model="window" vertical>
  		<p class="arial" >You have passed away....</p>
  		 <p class="arial">Better luck next time!</p>
  		 <CustomButton v-bind:text="texts.mainMenu"/>
  	</v-window>
  </v-container>
</template>

<script>
	import Game from "../components/Game";
	import CustomButton from "../components/CustomButton";

	export default {
		name: "GameOver",
		components: {
			Game,
			CustomButton,
		},
		data: () => ({
			images: {
				mainLogo: require('../../images/GameOver.png'),
				gradiant: require('../../images/Gradiant.gif')
			}
			texts: {
				mainMenu: "Main Menu",
			}
	    })
	  }
</script>

<style>
	@font-face {
	    font-family: "Bubbly";
	    src: url(../../fonts/Balloons.ttf) format("truetype");
	}
	.v-container {
		width: 100%;
	}
	.align-right {
		float: right;
	}
	.background {
		background-image: url(../../images/Gradiant.gif);
		background-repeat: no-repeat;
		background-size: 100% 100%;

		-webkit-filter: blur(10px);
		-moz-filter: blur(10px);
		-o-filter: blur(10px);
		-ms-filter: blur(10px);
		filter: blur(10px);

		max-width: 9999999px !important;

		display: block;
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		margin: 0;
	}
	.arial {
		font-family: arial;
		font-weight: boldest;
		font-size: 25px;
		color: white;
		/*-webkit-text-stroke: 1px black;*/
		text-shadow:
		   -1px -1px 0 #000,  
		    1px -1px 0 #000,
		    -1px 1px 0 #000,
		     1px 1px 0 #000;
	}
	body {
		background-color: black;
	}
	.bubbly {
		font-family: "Bubbly";
		font-size: 24px;
		color: white;
		text-shadow:
		   -1px -1px 0 #000,  
		    1px -1px 0 #000,
		    -1px 1px 0 #000,
		     1px 1px 0 #000;
	}
	.titleContainer {
		position: fixed;
		left: 50%;
		transform: translate(-50%, 0);
		margin-top: 20px;
	}
	.v-window {
		width: 400px;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 5px;
		padding: 30px;
	}
	.v-container {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}
</style>
