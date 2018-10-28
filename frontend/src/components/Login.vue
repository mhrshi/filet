<template>
	<v-app>
		<v-container v-if="$vuetify.breakpoint.smAndDown" fill-height>
			<v-layout align-start justify-center>
				<v-flex xs12 sm7 md7 lg5 xl4>
					<v-card class="login-card">
						<h3 class="headline mb-0">Log In</h3>
						<br/><br/>
						<v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
						<div class="user-wrap center">
						<v-select
							class="wrap-left pr-2"
							v-model="selected"
							item-text="IU"
							:items="prefixes"></v-select>
						<v-text-field
							@focus="onFocus"
							autofocus
							class="wrap-right"
							v-model="username"
							label="Username"
							name="username"
							:rules="[rules.required]"
							:error-messages="idError"></v-text-field>
						</div>
						<br/>
						<v-text-field
							@focus="onFocus"
							class="center"
							v-model="password"
							type="password"
							label="Password"
							name="password"
							hint="Minimum 8 characters"
							counter
							:rules="[rules.min]"
							:error-messages="pwdError">
						</v-text-field>
						<br/>
						<v-btn type="submit" color="primary">submit</v-btn>
						</v-form>
					</v-card>
				</v-flex>
			</v-layout>
		</v-container>
		<v-container class="pa-0" fill-height fluid v-else>
			<v-layout class="wrapper">
				<v-flex class="login grey lighten-4">
					<v-layout class="content" justify-center>
						<v-flex md9 xl7>
							<p class="text-xs-center display-1">Filet</p>
							<br/>
							<br/>
							<v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
								<div class="user-wrap">
									<v-select
										class="wrap-left pr-2"
										v-model="selected"
										item-text="IU"
										:items="prefixes">
									</v-select>
									<v-text-field
										@focus="onFocus"
										class="wrap-right"
										v-model="username"
										label="Username"
										name="username"
										:rules="[rules.required]"
										:error-messages="idError">
									</v-text-field>
								</div>
									<br/>
									<v-text-field
									@focus="onFocus"
									v-model="password"
									type="password"
									label="Password"
									name="password"
									hint="Minimum 8 characters"
									counter
									:rules="[rules.min]"
									:error-messages="pwdError">
								</v-text-field>
								<br/>
								<br/>
								<v-layout justify-center>
									<v-btn class="mx-auto px-0" type="submit" color="primary">log in</v-btn>
								</v-layout>
							</v-form>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex class="carousel-wrap">
					<v-carousel
						class="elevation-0 carousel-content"
						interval="7000"
						delimiter-icon="maximize"
						:ripple="false"
						hide-controls
						light>
					<v-carousel-item
						v-for="(item, i) in slideshowItems"
						:key="i">
						<div class="carousel-bg" :class="item.bgColor">
							<div class="content">
								<v-img
									:src="item.src"
									max-height="300"
									contain>
								</v-img>
								<v-layout justify-center>
									<p class="not-full-width pt-4 mt-3 title font-weight-regular">{{ item.desc }}</p>
								</v-layout>
							</div>
						</div>
					</v-carousel-item>
					</v-carousel>
				</v-flex>
			</v-layout>
		</v-container>
	</v-app>
</template>

<script>
export default {
	name: 'Login',
	data () {
		return {
			valid: false,
			prefixes: ['IU', 'FID'],
			selected: 'IU',
			username: '',
			password: '',
			idError: '',
			pwdError: '',
			rules: {
				required: value => !!value || 'Required',
				min: value => value.length >= 8 || 'Minimum 8 characters'
			},
			slideshowItems: [
				{
					src: './static/box.svg',
					bgColor: 'blue lighten-4',
					desc: 'Filet is a web-app to manage lab practical submissions'
				},
				{
					src: './static/upload.svg',
					bgColor: 'deep-orange lighten-4',
					desc: 'Students submit their practicals'
				},
				{
					src: './static/filter.svg',
					bgColor: 'lime lighten-5',
					desc: 'Faculties can fine-tune the submissions view'
				},
				{
					src: './static/download.svg',
					bgColor: 'indigo lighten-4',
					desc: 'Faculties can view/download the submissions'
				},
				{
					src: './static/review.png',
					bgColor: 'teal lighten-4',
					desc: 'Faculties can give their review'
				},
				{
					src: './static/papers.svg',
					bgColor: 'green lighten-4',
					desc: 'And everybody contributes towards saving paper :)'
				}
			]
		}
	},
	methods: {
		onSubmit: function() {
			console.log(`called`);
			if (!this.$refs.form.validate()) {
				return;
			}
			fetch('/entrance', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					prefix: this.selected,
					username: this.username,
					password: this.password
				})
			}).then(res => res.json())
			  .then(res => {
				  if (res.matched) {
					  const type = this.selected === 'IU' ? 'student' : 'faculty';
					  this.$store.commit('update', {
						  prefix: this.selected,
						  username: `${this.selected}${this.username}`
					  });
					  this.$router.push(`/${type}/${this.selected}${this.username}`);
				  } else {
					  this[res.errorIn] = res.error;
				  }
			  });
		},

		onFocus: function() {
			this.idError = '';
			this.pwdError = '';
		}
	}
}
</script>

<style scoped>

	.wrapper {
		display: flex;
	}

	.carousel-wrap {
		display: flex;
		flex-basis: 65%;
	}

	.login {
		display: flex;
		flex-basis: 35%;
	}

	.content {
		width: 100%;
		height: 50%;
		margin-top: auto;
		margin-bottom: auto;
	}

	.carousel-content {
		height: 100% !important;
	}

	>>>.v-window__container {
		height: 100% !important;
	}

	.v-window-item {
		height: 100%;
	}

	>>>.v-carousel__item {
		height: 100% !important;
	}

	>>>.v-responsive__content {
		display: flex;
	}

	>>>.v-carousel__controls {
		background: transparent;
	}

	>>>.v-btn--icon {
		color: #757575 !important;
	}

	>>>.v-btn--icon:hover {
		color: #000000 !important;
	}

	>>>.v-btn--active {
		color: #000000 !important;
	}

	>>>.v-carousel__controls__item:before {
		background: transparent;
	}

	.carousel-bg {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
	}
	.v-responsive {
		margin-left: auto;
		margin-right: auto;
	}

	.not-full-width {
		width: 70%;
		text-align: center;
		line-height: 25px !important;
	}

	.center {
		width: 80%;
		margin-left: auto;
		margin-right: auto;
	}
	.login-card {
		margin-top: 8vh;
		text-align: center;
		padding: 20px;
		margin-left: auto;
		margin-right: auto;
		width: 95%;
	}

	.user-wrap {
		display: flex;
	}

	.wrap-left {
		flex-basis: 10%;
	}

	.wrap-right {
		flex-basis: 80%;
	}

</style>
