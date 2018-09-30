<template>
	<v-app>
		<main>
			<v-container fill-height>
				<v-layout align-center justify-center>
					<v-flex xs12 sm7 md7 lg5 xl4>
						<v-card class="login-card">
							<h3 class="headline mb-0">{{ headerText }}</h3>
							<br/><br/>
							<v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
							<div class="user-wrap center">
							<v-text-field
								autofocus
								v-model="password"
								type="password"
								label="Password"
								name="password"
								hint="Minimum 8 characters"
								counter
								:rules="[rules.required, rules.min]"
								validate-on-blur></v-text-field>
							</div>
							<br/>
							<v-text-field
								class="center"
								v-model="confirm"
								type="password"
								label="Confirm Password"
								name="confirm"
								counter
								:rules="[rules.required, rules.min, rules.match]"
								validate-on-blur>
							</v-text-field>
							<br/>
							<v-btn type="submit" color="primary">submit</v-btn>
							</v-form>
						</v-card>
						<v-snackbar
							v-model="snackbar"
							bottom
							left
							:color="snackbarColor"
							:timeout="6000">
							{{ snackbarMessage }}
							<v-btn
								dark
								flat
								@click="snackbar = false">
								close
							</v-btn>
						</v-snackbar>
					</v-flex>
				</v-layout>
			</v-container>
		</main>
	</v-app>
</template>

<script>
	export default {
		name: 'Reset',
		data() {
			return {
				headerText: '',
				valid: false,
				confirm: '',
				password: '',
				rules: {
					required: value => !!value || 'Required',
					min: value => value.length >= 8 || 'Minimum 8 characters',
					match: value => value === this.password || 'Passwords don\'t match'
				},
				snackbarColor: '',
				snackbarMessage: '',
				snackbar: false
			}
		},

		methods: {
			onSubmit() {
				if (!this.$refs.form.validate()) {
					return;
				}
				fetch('/renew/password', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						resetid: this.$route.params.resetid,
						password: this.confirm
					})
				}).then(res => res.json())
				  .then(res => {
					  if (res.code === 200) {
						  this.snackbarColor = 'success';
					  } else {
						  this.snackbarColor = 'error';
					  }
					  this.snackbarMessage = res.message;
					  this.snackbar = true;
					  setTimeout(() => {
						  this.$router.push('/login');
					  }, 6000);
				  })
			}
		},

		mounted: function() {
			fetch('/renew/getInfo', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					resetid: this.$route.params.resetid
				})
			}).then(res => res.json())
			  .then(res => {
				  this.headerText = `Reset - ${res.username}`
			  })
		}
	}
</script>

<style scoped>

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
		margin: 0 auto;
		width: 80%;
		justify-content: space-between;
	}
	.wrap-left {
		flex-basis: 10%;
		margin-right: 12px;
	}
	.wrap-right {
		flex-basis: 80%;
	}

</style>
