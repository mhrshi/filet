import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/components/Login';
import StudentDash from '@/components/StudentDash';
import FacultyDash from '@/components/FacultyDash';
import FourHundredFour from '@/components/FourHundredFour';
import { store } from '../store';

Vue.use(Router);

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'Root',
			beforeEnter: (to, from, next) => {
				fetch('/secure/check')
					.then(res => res.json())
					.then(res => {
						if (res.code === 200) {
							const type = res.prefix === 'IU' ? 'student' : 'faculty';
							next(`/${type}/${res.username}`);
							store.commit('update', {
								prefix: res.prefix,
								username: res.username
							});
						} else {
							next('/login');
						}
					}).catch(error => {
						next('/FourHundredFour');
					});
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: Login
		},
		{
			path: '/student/:id',
			name: 'StudentDash',
			component: StudentDash,
			beforeEnter: (to, from, next) => {
				console.log('before entering StudentDash');
				fetch('/secure/check')
					.then(res => res.json())
					.then(res => {
						if (res.code === 401) {
							next('/login');
						} else {
							next();
							store.commit('update', {
								prefix: res.prefix,
								username: res.username
							});
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
				fetch('/secure/check')
					.then(res => res.json())
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
