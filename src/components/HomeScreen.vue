<template >
  <v-container>
  	<v-container class="background">
 	</v-container>

  	<v-container class="titleContainer">
  		<v-img :src="images.mainLogo" aspect-ratio="5.8" width="800px" class="titleContainer"></v-img>
 	</v-container>
  	<v-window class="elevation-4 grey lighten-5" v-model="window" vertical>
  		 <CustomP v-bind:text="texts.text1"/>
  		 <CustomP v-bind:text="texts.text2"/>
  		 <CustomButton v-bind:text="texts.play"/>
  	</v-window>
  </v-container>
</template>

<script>
	import Game from "../components/Game";
	import CustomButton from "../components/CustomButton";
	import CustomP from "../components/CustomP";

	export default {
		name: "HomeScreen",
		components: {
			Game,
			CustomButton,
			CustomP,
		},
		data: () => ({
			images: {
				mainLogo: require('../../images/MainLogo.png'),
				gradiant: require('../../images/Gradiant.gif')
			},
			texts: {
				play: "Play",
				text1: "Welcome to Blob tanks!",
				text2: "A top down tank shooting game",
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
