import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
	strict: true,

	state: {
		prefix: '',
		username: '',
		pracList: [],
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
		},
		E1stats: state => {
			const enrolls = [...new Set(state.practicals['E1'].map(item => item.e_no))];
			return enrolls.map(enroll => {
				let done = 0;
				const submitted = {};
				for (const item of state.practicals['E1']) {
					if (item.e_no === enroll) {
						done++;
						submitted[`${item.id}`] = item.status;
					}
				}
				return { enroll, done, submitted };
			});
		},
		E2stats: state => {
			const enrolls = [...new Set(state.practicals['E2'].map(item => item.e_no))];
			return enrolls.map(enroll => {
				let done = 0;
				const submitted = {};
				for (const item of state.practicals['E2']) {
					if (item.e_no === enroll) {
						done++;
						submitted[`${item.id}`] = item.status;
					}
				}
				return { enroll, done, submitted };
			});
		},
		E3stats: state => {
			const enrolls = [...new Set(state.practicals['E3'].map(item => item.e_no))];
			return enrolls.map(enroll => {
				let done = 0;
				const submitted = {};
				for (const item of state.practicals['E3']) {
					if (item.e_no === enroll) {
						done++;
						submitted[`${item.id}`] = item.status;
					}
				}
				return { enroll, done, submitted };
			});
		}
	},

	mutations: {
		update(state, payload) {
			state.prefix = payload.prefix;
			state.username = payload.username;
		},

		setPracList(state, payload) {
			Object.assign(state.pracList, payload.pracList);
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

		updateContent(state, { content, uuid, batch }) {
			state.practicals[batch.name][uuid].content = content;
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
