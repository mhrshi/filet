import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/components/Login';
import StudentDash from '@/components/StudentDash';
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
				fetch('/api/secure/check')
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
				fetch('/api/secure/check')
					.then(res => res.json())
					.then(res => {
						if (res.code === 401) {
							next('/login');
						} else {
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