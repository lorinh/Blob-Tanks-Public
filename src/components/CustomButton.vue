<template >
  <v-container>
  		 <v-btn color="success" class="align-right" to={{goal}}>{{text}}</v-btn>
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
	    	goal: String
	    }
	  }
</script>

<style>

</style>
