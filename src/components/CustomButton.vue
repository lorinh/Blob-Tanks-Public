<template >
  <v-container>
  		 <v-btn color="success" class="align-right" to="/game">{{text}}</v-btn>
  </v-container>
</template>

<script>
	import Game from "../components/Game";
	export default {
		name: "CustomButton",
		components: {
			Game
		},
		data: () => ({
	    }),
	    props: {
	    	text: String,
	    }
	  }
</script>

<style>

</style>
