<template>
	<v-app>
		<main>
			<v-container fill-height>
				<v-layout align-center justify-center>
					<v-flex xs12 sm8 md4>
						<v-card class="login-card">
							<h3 class="headline mb-0">Log In</h3>
							<br/><br/>
							<v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
							<div class="user-wrap center">
							<v-select
								class="wrap-left"
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
								:error-messages="idError"
								validate-on-blur></v-text-field>
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
								:error-messages="pwdError"
								validate-on-blur>
							</v-text-field>
							<br/>
							<v-btn type="submit" color="primary">submit</v-btn>
							</v-form>
						</v-card>
					</v-flex>
				</v-layout>
			</v-container>
		</main>
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
			}
		}
	},
	methods: {
		onSubmit: function() {
			if (!this.$refs.form.validate()) {
				return;
			}
			fetch('/entrance', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
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
