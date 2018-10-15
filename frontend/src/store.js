import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
	strict: true,

	state: {
		prefix: '',
		username: '',
		practicals: {
			E1: [],
			E2: [],
			E3: []
		},
		filter: {
			enroll: -1,
			pracid: -1,
			type: ''
		}
	},

	getters: {
		filtered: state => batch => {
			if (!batch.name) {
				return [];
			}
			if (!state.filter.type) {
				return state.practicals[batch.name];
			}
			if (state.filter.type === 'prac') {
				return state.practicals[batch.name]
							.filter(prac => prac.id === state.filter.pracid);
			} else {
				return state.practicals[batch.name]
							.filter(prac => prac.e_no.endsWith(state.filter.enroll));
			}
		}
	},

	mutations: {
		update(state, payload) {
			state.prefix = payload.prefix;
			state.username = payload.username;
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
			state.filter.enroll = `${('0' + payload.enroll).slice(-2)}`;
		},

		updateStatii(state, { batch, statii }) {
			statii.forEach(entry => {
				state.practicals[batch.name][entry.uuid].status = entry.status;
			})
		},

		updateCode(state, { code, uuid, batch }) {
			state.practicals[batch.name][uuid].code = code;
		},

		resetFilter(state) {
			state.filter = {
				enroll: -1,
				pracid: -1,
				type: ''
			}
		},

		resetState(state) {
			Object.assign(state, {
				prefix: '',
				username: ''
			})
		},
	}
});
