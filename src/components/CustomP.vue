<template >
  <v-container>
  		 <p class="arial" >{{text}}</p>
  </v-container>
</template>

<script>
	export default {
		name: "CustomP",
		components: {
		},
		data: () => ({
	    }),
	    props: {
	    	text: String,
	    }
	  }
</script>

<style>
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
</style>
