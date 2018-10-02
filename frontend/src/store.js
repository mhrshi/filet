const Vue = import('vue');
const Vuex = import('vuex');

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
