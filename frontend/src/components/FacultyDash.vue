<template>
	<v-app>
    <v-toolbar prominent>
		<v-toolbar-title class="headline">Filet</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-menu offset-y>
			<v-btn slot="activator" color="primary" outline>
				{{ this.$store.state.username }}
			</v-btn>
			<v-list>
				<v-list-tile
					v-for="(item, index) in overflowItems"
					:key="index"
					@click="onLogout">
					<v-list-tile-title>{{ item.title }}</v-list-tile-title>
				</v-list-tile>
			</v-list>
		</v-menu>
    </v-toolbar>
	<main>
		<v-container fill-height>
			<v-layout align-center justify-center>
				<v-flex xs12 lg8 xl8>
					<v-data-table
						:headers="headers"
						v-model="selected"
						no-data-text="Nothing to display :("
						:items="indexedPracs"
						item-key="uuid"
						hide-actions
						must-sort
						select-all
						class="elevation-1">
						<template slot="items" slot-scope="props">
							<td>
								<v-checkbox
									v-model="props.selected"
									primary
									hide-details>
								</v-checkbox>
							</td>
							<td class="text-xs-right">{{ props.item.id }}</td>
							<td class="text-xs-center">{{ props.item.e_no }}</td>
							<td class="text-xs-center">{{ props.item.name }}</td>
						</template>
						<template slot="footer">
							<td colspan="100%">
								<v-btn
									:disabled="throttled"
									class="clickable"
									flat
									@click="downloadFiles"
									color="primary">
									Download files
								</v-btn>
							</td>
						</template>
					</v-data-table>
				</v-flex>
			</v-layout>
		</v-container>
	</main>
	<iframe download class="dummy" name="dummyframe">
		<form download target="dummyframe" ref="dummyform" method="POST" action="/secure/downloadFiles">
			<input download ref="dummyinput" type="text" name="incoming" value="" />
		</form>
	</iframe>
	</v-app>
</template>

<script>
	export default {
		name: 'FacultyDash',
		data() {
			return {
				selected: [],
				headers: [
					{
						text: 'Practical No.',
						align: 'right',
						sortable: false,
						value: 'id'
					},
					{
						text: 'Enrolment No.',
						align: 'center',
						sortable: false,
						value: 'e_no'
					},
					{
						text: 'Practical Name',
						align: 'center',
						sortable: false,
						value: 'name'
					}
				],
				throttled: false,
				practicals: [],
				overflowItems: [
					{ title: 'Logout' }
				],
				incoming: ''
			}
		},

		methods: {
			downloadFiles() {
				if (this.selected.length <= 0) {
					return;
				}
				this.throttled = true;
				setTimeout(() => {
					this.throttled = false;
				}, 20000);
				this.$refs.dummyinput.value = JSON.stringify(this.selected);
				this.$refs.dummyform.submit();
			},

			onLogout() {
				document.cookie = 'FiletLog=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
				this.$store.commit('update', {
					prefix: '',
					username: ''
				});
				this.$router.push('/login');
			}
		},

		computed: {
    		indexedPracs () {
      			return this.practicals.map((item, index) => ({
        			uuid: index,
        			...item
      			}))
    		}
  		},

		mounted: async function() {
			if (this.$route.params.id !== this.$store.state.username) {
				this.$router.replace(`/student/${this.$store.state.username}`);
			}
			fetch('/secure/practicals/submitted', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					subject: this.$store.state.username.slice(3).toLowerCase()
				})
			}).then(res => res.json())
			  .then(practicals => {
				    this.practicals = practicals;
			  })
		}
	}
</script>

<style scoped>
	.dummy {
		display: none;
	}

	.clickable {
		cursor: pointer;
	}
</style>
