import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {
		prefix: '',
		username: ''
	},
	mutations: {
		update(state, payload) {
			state.prefix = payload.prefix;
			state.username = payload.username;
		}
	}
});
