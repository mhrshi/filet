const Vue = import('vue');
const Router = import('vue-router');
const Login = import('@/components/Login');
const StudentDash = import('@/components/StudentDash');
const FacultyDash = import('@/components/FacultyDash');
const Reset = import('@/components/Reset');
const FourHundredFour = import('@/components/FourHundredFour');
const { store } = import('../store');

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
				fetch('/secure/check')
					.then(res => res.json())
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
