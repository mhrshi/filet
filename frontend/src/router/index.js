import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/components/Login';
import StudentDash from '@/components/StudentDash';
import FacultyDash from '@/components/FacultyDash';
import Guide from '@/components/Guide';
import Reset from '@/components/Reset';
import Resetter from '@/components/Resetter';
import FourHundredFour from '@/components/FourHundredFour';
import { store } from '../store';

Vue.use(Router);

const router = new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'Root',
			redirect: '/login'
		},
		{
			path: '/login',
			name: 'Login',
			component: Login,
			beforeEnter: (to, from, next) => {
				fetch('/secure/check', {
					credentials: 'same-origin',
				}).then(res => res.json())
				  .then(res => {
						if (res.code === 401) {
							next();
						} else {
							const type = res.prefix === 'IU' ? 'student' : 'faculty';
							next(`/${type}/${res.username}`);
							store.commit('update', {
								prefix: res.prefix,
								username: res.username
							});
						}
					}).catch(error => {
						next();
					});
			}
		},
		{
			path: '/student/:id',
			name: 'StudentDash',
			component: StudentDash,
			beforeEnter: (to, from, next) => {
				fetch('/secure/check', {
					credentials: 'same-origin',
				}).then(res => res.json())
				  .then(res => {
						if (res.code === 401) {
							next('/login');
						} else {
							store.commit('update', {
								prefix: res.prefix,
								username: res.username
							});
							next();
						}
					}).catch(error => {
						next('/FourHundredFour');
					});
			}
		},
		{
			path: '/faculty/:id',
			name: 'FacultyDash',
			component: FacultyDash,
			beforeEnter: (to, from, next) => {
				fetch('/secure/check', {
					credentials: 'same-origin',
				}).then(res => res.json())
				  .then(res => {
						if (res.code === 401) {
							next('/login');
						} else {
							store.commit('update', {
								prefix: res.prefix,
								username: res.username
							});
							next();
						}
					}).catch(error => {
						next('/FourHundredFour');
					});
			}
		},
		{
			path: '/guide',
			name: 'Guide',
			component: Guide
		},
		{
			path: '/reset/:resetid',
			name: 'Reset',
			component: Reset,
			beforeEnter: (to, from, next) => {
				fetch('/renew/check', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					credentials: 'same-origin',
					body: JSON.stringify({
						resetid: to.params.resetid
					})
				}).then(res => res.json())
				  .then(res => {
				      if (res.code === 200) {
						  next();
					  } else {
						  next('/FourHundredFour');
					  }
				  }).catch(error => next('/FourHundredFour'));
			}
		},
		{
			path: '/resetter',
			name: 'Resetter',
			component: Resetter,
			beforeEnter: (to, from, next) => {
				fetch('/secure/check', {
					credentials: 'same-origin',
				}).then(res => res.json())
				  .then(res => {
						if (res.code === 401) {
							next('/FourHundredFour');
						} else if (res.username === 'IU1641100011') {
							next();
						} else {
							next('/FourHundredFour');
						}
					}).catch(error => {
						next('/FourHundredFour');
					});
			}
		},
		{
			path: '/FourHundredFour',
			name: 'FourHundredFour',
			component: FourHundredFour
		},
		{
			path: '*',
			redirect: '/FourHundredFour'
		}
	]
});

export default router;
