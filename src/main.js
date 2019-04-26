import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VueRouter from "vue-router";

import Game from "./components/Game";
import HomeScreen from "./components/HomeScreen";
import GameOver from "./components/GameOver";

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.config.productionTip = false


new Vue({
	render: h => h(App),
	router: new VueRouter({
		routes: [
		// Put your routes in here
			{ path: '/', component: HomeScreen },
			{ path: '/Game', component: Game },
			{ path: '/GameOver', component: GameOver}
		]
	}),
}).$mount('#app')
