<template>
	<v-app>
    <v-toolbar prominent>
		<v-toolbar-title class="headline">Filet</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-menu offset-y>
			<v-btn slot="activator" icon>
				<v-icon>more_vert</v-icon>
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
				practicals: [],
				overflowItems: [
					{ title: 'Logout' }
				]
			}
		},

		methods: {
			downloadFiles() {
				if (this.selected.length <= 0) {
					return;
				}
				fetch('/secure/downloadFiles', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						rows: this.selected
					})
				}).then(response => response.blob())
				  .then(blob => {
					const link = window.URL.createObjectURL(blob);
					const a = document.createElement('a');
					link.download = 'filet.zip';
					a.href = link;
					a.click();
        		});

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
			fetch('/secure/practicals/completed', {
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
