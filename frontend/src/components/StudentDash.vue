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
					<v-flex class="subject-select" xs12 sm6 md6 lg6 xl4>
						<v-select
							v-model="select"
							@change="subjectChange"
							class="select-subject"
							:items="subjects"
							item-text="name"
							item-value="id"
							label="Subject"
							solo>
						</v-select>
					</v-flex>
					<v-dialog v-model="dialog" max-width="700px">
						<v-card>
							<v-card-title>
								<span class="font-weight-regular title">Edit File ID</span>
							</v-card-title>
							<v-card-text>
								<v-container>
									<v-text-field
										v-model="editedItem.fileid"
										label="File ID">
									</v-text-field>
								</v-container>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
								<v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
							</v-card-actions>
						</v-card>
					</v-dialog>
					<v-data-table
						:headers="headers"
						no-data-text="Please select a subject :)"
						:items="practicals"
						hide-actions
						must-sort
						class="elevation-1">
						<template slot="items"
									slot-scope="props">
							<td class="text-xs-right">{{ props.item.id }}</td>
							<td class="text-xs-center">{{ props.item.name }}</td>
							<td class="text-xs-center">{{ props.item.fileid }}</td>
							<td class="justify-center align-center layout px-0">
								<v-icon @click="editItem(props.item)">edit</v-icon>
							</td>
						</template>
					</v-data-table>
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
		name: 'StudentDash',
		data () {
			return {
				dialog: false,
				snackbar: false,
				snackbarColor: '',
				snackbarMessage: '',
				editedIndex: -1,
				editedItem: {
					id: '',
					name: '',
					fileid: ''
				},
				defaultItem: {
					id: '',
					name: '',
					fileid: ''
				},
				select: {},
				subjects: [],
				headers: [
					{
						text: 'Number',
						align: 'center',
						sortable: false,
						value: 'id'
					},
					{
						text: 'Name',
						align: 'center',
						sortable: false,
						value: 'name'
					},
					{
						text: 'File ID',
						align: 'center',
						sortable: false,
						value: 'fileid'
					},
					{
						text: 'Edit',
						align: 'center',
						sortable: false,
						value: 'edit'
					}
				],
				practicals: [],
				IT0501: [],
				IT0502: [],
				IT0504: [],
				IT0604: [],
				overflowItems: [
					{ title: 'Logout' }
				]
			}
		},

		methods: {
			subjectChange(subject) {
				if (this.select.endsWith('04')) {
					this.practicals = [];
					return;
				}
				if (this[this.select].length > 0) {
					this.practicals = this[this.select];
					return;
				}
				fetch('/secure/practicals', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						subject: this.select.toLowerCase(),
						username: this.$store.state.username
					})
				}).then(res => res.json())
				  .then(practicals => {
						this.practicals = practicals;
						this[this.select] = practicals;
					})
				  .catch(error => {});
			},
			editItem(item) {
				this.editedIndex = this.practicals.indexOf(item);
				this.editedItem = Object.assign({}, item);
				this.dialog = true;
			},
			close() {
				this.dialog = false;
				this.editedItem = Object.assign({}, this.defaultItem);
				this.editedIndex = -1;
			},
			save() {
				const link = this.editedItem.fileid;
				if (link !== null && link.length > 0) {
					this.editedItem.fileid = link.slice(link.indexOf('=') + 1);
				}
				Object.assign(this.practicals[this.editedIndex], this.editedItem);
				this[this.select] = this.practicals;
				fetch('/secure/revise', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						subject: this.select.toLowerCase(),
						username: this.$store.state.username,
						fileid: this.editedItem.fileid,
						pracid: this.editedItem.id
					})
				}).then(res => res.json())
				  .then(res => {
					  if (res.code === 200) {
						    this.snackbarColor = "success";
							this.snackbarMessage = "File ID saved successfully";
					  } else {
						    this.snackbarColor = "error";
						    this.snackbarMessage = "Error saving File ID";
					  }
					  this.snackbar = true;
				  });
				this.close();
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

		watch: {
			dialog(val) {
				val || this.close();
			}
		},

		mounted: async function() {
			fetch('/secure/subjects')
				.then(res => res.json())
				.then(subjects => {
					this.subjects = subjects;
				});
		}
	}

</script>

<style scoped>
	.subject-select {
		margin: 0 auto;
	}

	.edit-icon {
		cursor: pointer;
	}
</style>
