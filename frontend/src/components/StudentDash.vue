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
					to="/guide/">
					<v-list-tile-title>Guide</v-list-tile-title>
				</v-list-tile>
				<v-list-tile
					@click="onLogout">
					<v-list-tile-title>Log out</v-list-tile-title>
				</v-list-tile>
			</v-list>
		</v-menu>
    </v-toolbar>
	<main>
		<v-container fill-height>
			<v-layout align-center justify-center>
				<v-flex xs12 lg10 xl8>
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
					<v-dialog v-model="dialog" max-width="700px" persistent>
						<v-card>
							<v-card-title>
								<span class="font-weight-regular title">Edit File ID</span>
							</v-card-title>
							<v-card-text>
								<v-container grid-list-md>
									<v-flex>
										<v-text-field
											v-if="dialog"
											v-model="editedItem.fileid"
											label="Shareable link"
											autofocus>
										</v-text-field>
									</v-flex>
								</v-container>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn color="primary darken-1" flat @click.native="close">Cancel</v-btn>
								<v-btn color="primary darken-1" flat @click.native="save">Save</v-btn>
							</v-card-actions>
						</v-card>
					</v-dialog>
					<v-data-table
						:headers="headers"
						no-data-text="Please select a subject :)"
						:items="practicals"
						:loading="pracLoader"
						hide-actions
						must-sort
						class="elevation-1">
						<template slot="items"
									slot-scope="props">
							<td class="text-xs-right">{{ props.item.id }}</td>
							<td class="text-xs-center eye-cursor" @click="openPractical(props.item)">{{ props.item.name }}</td>
							<td class="text-xs-center">{{ props.item.fileid || '&horbar;' }}</td>
							<td class="text-xs-center">
								<v-tooltip
									open-delay="600"
									close-delay="0"
									top>
									<v-icon
										class="default-cursor"
										slot="activator"
										:color="props.item.fileid ? statuses[props.item.status].color : 'rgba(33, 33, 33, 0.3)'">
										{{ statuses[props.item.status].icon }}
									</v-icon>
									<span>{{ statuses[props.item.status].desc }}</span>
								</v-tooltip>
							</td>
							<td class="justify-center align-center layout px-0">
								<v-icon @click="editItem(props.item)">edit</v-icon>
							</td>
						</template>
					</v-data-table>
					<v-dialog
						v-model="pracDialog.open"
						transition="dialog-bottom-transition"
						fullscreen
						hide-overlay>
						<v-card>
							<v-toolbar prominent dark color="primary">
								<v-btn icon dark @click.native="closePracDialog">
									<v-icon>close</v-icon>
								</v-btn>
								<v-toolbar-title class="headline font-weight-regular">{{ pracDialog.title }}</v-toolbar-title>
							</v-toolbar>
							<v-img
								class="ma-4"
								v-if="pracDialog.isImage && !pracDialog.loading"
								:src="pracDialog.imageSrc"
								contain>
							</v-img>
							<div class="pa-4 subheading code" v-else-if="!pracDialog.isImage && !pracDialog.loading">{{ pracDialog.code }}</div>
							<v-container class="pa-4" fill-height v-else>
							<v-layout
								column
								fill-height
								align-center
								justify-center
								ma-0>
								<v-flex
									align-center
									justify-center>
									<v-progress-circular
										color="primary"
										size="40"
										indeterminate>
									</v-progress-circular>
								</v-flex>
							</v-layout>
							</v-container>
						</v-card>
					</v-dialog>
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
		data() {
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
						text: 'Review',
						align: 'center',
						sortable: false,
						value: 'status'
					},
					{
						text: 'Edit',
						align: 'center',
						sortable: false,
						value: 'edit'
					}
				],
				statuses: [
					{
						icon: 'check_circle',
						color: 'success',
						desc: 'Accepted'
					},
					{
						icon: 'remove_circle',
						color: 'primary',
						desc: 'Pending'
					},
					{
						icon: 'cancel',
						color: 'error',
						desc: 'Rejected'
					}
				],
				pracLoader: false,
				practicals: [],
				pracDialog: {
					open: false,
					title: '',
					code: '',
					isImage: false,
					imageSrc: '',
					loading: false,
				},
				IT0501: [],
				IT0502: [],
				IT0505: []
			}
		},

		methods: {
			subjectChange(subject) {
				if (this[this.select].length > 0) {
					this.practicals = this[this.select];
					return;
				}
				this.pracLoader = true;
				fetch('/secure/practicals', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					credentials: 'same-origin',
					body: JSON.stringify({
						subject: this.select.toLowerCase(),
						username: this.$store.state.username
					})
				}).then(res => res.json())
				  .then(practicals => {
						this.practicals = practicals;
						this[this.select] = practicals;
						this.pracLoader = false;
					})
				  .catch(error => {
					    this.pracLoader = false;
				  });
			},

			editItem(item) {
				this.editedIndex = this.practicals.indexOf(item);
				this.editedItem = Object.assign({}, item);
				this.dialog = true;
			},

			save() {
				const link = this.editedItem.fileid;
				this.dialog = false;
				if (link.length === 0) {
					this.pracLoader = true;
					this.editedItem.fileid = '';
					this.handshake();
					return;
				}
				if (!(/^(https:\/\/)?(www.)?drive.google.com\/open\?id=([^\s\/=]+)$/.test(link))) {
					this.close();
					this.showSnackbar("error", "Invalid link");
					return;
				}
				this.pracLoader = true;
				this.editedItem.fileid = link.slice(link.indexOf('=') + 1);
				this.handshake();
			},

			async handshake() {
				try {
					let res = await fetch('/secure/revise', {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						credentials: 'same-origin',
						body: JSON.stringify({
							subject: this.select.toLowerCase(),
							username: this.$store.state.username,
							fileid: this.editedItem.fileid,
							filetype: this.editedItem.filetype,
							pracid: this.editedItem.id
						})
					});
					res = await res.json();
					if (res.code === 200) {
						this.showSnackbar("success", res.message);
						this.commit();
					} else {
						this.showSnackbar("error", res.message);
					}
				} catch(error) {
					this.showSnackbar("error", "Error saving File ID");
				}
				this.resetDefault();
				this.pracLoader = false;
			},

			commit() {
				Object.assign(this.practicals[this.editedIndex], this.editedItem);
				this[this.select] = this.practicals;
			},

			close() {
				this.dialog = false;
				this.resetDefault();
			},

			resetDefault() {
				this.editedItem = Object.assign({}, this.defaultItem);
				this.editedIndex = -1;
			},

			openPractical(item) {
				if (this.practicals[item.id - 1].filetype === 'pdf') {
					const newTab = window.open();
					fetch('/secure/downloadBlob', {
					method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						credentials: 'same-origin',
						body: JSON.stringify({
							fileid: item.fileid
						})
					}).then(res => res.blob())
				  	  .then(blob => {
							const url = URL.createObjectURL(blob);
							newTab.location = url;
				  })
				} else {
					this.openPracDialog(item);
				}
			},

			async fetchBlob(item) {
				let res = await fetch('/secure/downloadBlob', {
					method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						credentials: 'same-origin',
						body: JSON.stringify({
							fileid: item.fileid
						})
				});
				const filetype = res.headers.get('file-type');
				this.practicals[item.id - 1].filetype = filetype;
				res = await res.json();
				this[this.select][item.id - 1].content = res.content;
				this.practicals[item.id - 1].content = res.content;
				return res.content;
			},

			async openPracDialog(item) {
				this.pracDialog.title = item.name;
				let prop = '';
				let filetype = this.practicals[item.id - 1].filetype;
				let content = this.practicals[item.id - 1].content;
				this.pracDialog.open = true;
				this.pracDialog.loading = true;
				if (filetype === 'any' || !content) {
					content = await this.fetchBlob(item);
				}
				filetype = this.practicals[item.id - 1].filetype;
				if (filetype === 'img') {
					this.pracDialog.isImage = true;
					prop = 'imageSrc';
				} else {
					this.pracDialog.isImage = false;
					prop = 'code';
				}
				this.pracDialog[prop] = content;
				this.pracDialog.loading = false;
			},

			closePracDialog() {
				this.pracDialog.open = false;
				this.pracDialog.loading = false;
				this.pracDialog.code = '';
				this.pracDialog.imageSrc = '';
			},

			showSnackbar(color, message) {
				this.snackbarColor = color;
				this.snackbarMessage = message;
				this.snackbar = true;
			},

			onLogout() {
				this.$router.push('/login');
				document.cookie = 'FiletLog=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				this.$store.commit('resetState');
			}
		},

		mounted: async function() {
			if (this.$route.params.id !== this.$store.state.username) {
				this.$router.replace(`/student/${this.$store.state.username}`);
			}
			fetch('/secure/subjects', {
				credentials: 'same-origin',
			}).then(res => res.json())
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

	td {
		white-space: nowrap;
	}

	.code {
		font-family: 'Roboto Mono';
		white-space: pre-wrap;
	}

	.default-cursor {
		cursor: default;
	}

	.eye-cursor {
		cursor: url('./eye.svg'), pointer;
	}
</style>
