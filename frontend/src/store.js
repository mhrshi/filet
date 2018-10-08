import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {
		prefix: '',
		username: '',
		practicals: {
			E1: [],
			E2: [],
			E3: []
		},
		filter: {
			start: -1,
			end: -1,
			pracid: -1,
			type: ''
		}
	},
	mutations: {
		update(state, payload) {
			state.prefix = payload.prefix;
			state.username = payload.username;
		},

		resetStore(state) {
			Object.assign(state, {
				prefix: '',
				username: ''
			})
		},

		setPracticals(state, payload) {
			Object.assign(state.practicals[payload.batch], payload.data);
		},

		updatePracticalFilter(state, payload) {
			state.filter.type = 'prac';
			state.filter.pracid = payload.pracid;
		},

		updateEnrolFilter(state, payload) {
			state.filter.type = 'eno';
			state.filter.start = payload.start;
			state.filter.end = payload.end;
		},

		resetFilter(state) {
			state.filter = {
				start: -1,
				end: -1,
				pracid: -1,
				type: ''
			}
		}
	}
});
