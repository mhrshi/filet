<template>
	<v-app>
		<v-toolbar tabs prominent>
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
			<v-tabs
				slot="extension"
				v-model="tabModel"
				color="#f5f5f5"
				slider-color="primary"
				fixed-tabs
				centered>
				<v-tab
					v-for="(tab, i) in tabs"
					:key="i"
					:href="`#tab-${i}`">
					{{ tab }}
				</v-tab>
			</v-tabs>
		</v-toolbar>
		<v-tabs-items v-model="tabModel" touchless>
			<v-tab-item
				value="tab-0"
				key="0">
				<main>
					<v-container fill-height>
						<v-layout align-center justify-center>
							<v-flex xs12 lg8 xl8>
								<v-dialog v-model="deadlineDialog" max-width="700px" persistent>
									<v-card>
										<v-card-title>
											<span class="font-weight-regular title">Update deadline</span>
										</v-card-title>
										<v-card-text>
											<v-container>
												<v-layout justify-space-around wrap>
													<v-flex xs12 sm5 md5>
												<v-menu
													ref="dateMenu"
													:close-on-content-click="false"
													transition="scale-transition"
													lazy
													offset-y
													full-width>
													<v-text-field
														slot="activator"
														v-model="inputtedDate"
														label="Date"
														prepend-icon="event"
														readonly>
													</v-text-field>
													<v-date-picker
														first-day-of-week="1"
														v-model="inputtedDate"
														@input="$refs.dateMenu.save(inputtedDate)"
														locale="en-in">
													</v-date-picker>
												</v-menu>
													</v-flex>
													<v-flex xs12 sm5 md5>
												<v-menu
													ref="timeMenu"
													v-model="timeMenu"
													:close-on-content-click="false"
													transition="scale-transition"
													lazy
													offset-y
													full-width>
													<v-text-field
														slot="activator"
														v-model="inputtedTime"
														label="Time"
														prepend-icon="access_time"
														readonly>
													</v-text-field>
													<v-time-picker
														v-if="timeMenu"
														v-model="inputtedTime"
														format="24hr"
														@change="$refs.timeMenu.save(inputtedTime)"
														full-width>
													</v-time-picker>
												</v-menu>
													</v-flex>
												</v-layout>
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
									:headers="listHeaders"
									no-data-text="Nothing to display :("
									:loading="listLoader"
									:items="list"
									item-key="uuid"
									hide-actions
									must-sort
									class="elevation-1">
									<template slot="items" slot-scope="props">
										<td class="text-xs-right">{{ props.item.id }}</td>
										<td class="text-xs-center">{{ props.item.name }}</td>
										<td class="text-xs-center">{{ props.item.deadline || '&horbar;' }}</td>
										<td class="justify-center align-center layout px-0">
											<v-icon @click="editItem(props.item)">edit</v-icon>
										</td>
									</template>
								</v-data-table>
							</v-flex>
						</v-layout>
					</v-container>
				</main>
			</v-tab-item>
			<v-tab-item
				value="tab-1"
				key="1">
				<main>
					<v-container fill-height>
						<v-layout align-center justify-center>
							<v-flex xs12 lg8 xl8>
								<v-flex class="batch-select" xs12 sm6 md6 lg6 xl4>
									<v-select
										ref="batchSelect"
										v-model="batchSelect"
										:disabled="reviewMode"
										@change="batchChange"
										class="select-subject"
										:items="batches"
										item-text="name"
										item-value="id"
										:hint="`${batchSelect.range || '' }`"
										label="Batch"
										persistent-hint
										return-object
										solo>
									</v-select>
								</v-flex>
								<v-data-table
									:headers="practicalHeaders"
									v-model="selected"
									:pagination.sync="pagination"
									:no-data-text="batchSelect.name ? 'No matching results found' : 'Please select a batch to continue'"
									:loading="pracLoader"
									:items="reviewMode ? reviewPracs : indexedPracs"
									item-key="uuid"
									:rows-per-page-items="rowsPerPageItems"
									sort-icon="visibility"
									must-sort
									select-all
									class="elevation-1">
									<template slot="items" slot-scope="props">
										<tr >
										<td>
											<v-checkbox
												v-model="props.selected"
												primary
												hide-details>
											</v-checkbox>
										</td>
										<td class="text-xs-center">{{ props.item.e_no }}</td>
										<td class="text-xs-right">{{ props.item.id }}</td>
										<td class="text-xs-center eye-cursor" @click="openPracDialog(props.item)">{{ props.item.name }}</td>
										<td class="text-xs-center">
											<template v-if="reviewMode">
													<v-tooltip
														v-for="(status, i) in statuses"
														open-delay="600"
														close-delay="0"
														:key="i"
														top>
														<v-icon
															:key="i"
															slot="activator"
															class="ml-1"
															:color="props.item.status === i ? status.color : 'rgba(33, 33, 33, 0.3)'"
															@click="changeStatus(props.item, i)">
															{{ status.icon }}
														</v-icon>
														<span>{{ status.desc }}</span>
													</v-tooltip>
											</template>
											<template v-else>
												<v-tooltip
													open-delay="600"
													close-delay="0"
													top>
													<v-icon class="default-cursor" slot="activator" :color="statuses[props.item.status].color">
														{{ statuses[props.item.status].icon }}
													</v-icon>
													<span>{{ statuses[props.item.status].desc }}</span>
												</v-tooltip>
											</template>
										</td>
										</tr>
									</template>
									<template slot="footer">
										<td colspan="100%" class="text-xs-right">
											<v-btn
												v-if="reviewMode"
												class="clickable"
												flat
												@click="cancelReviews"
												color="primary">
												CANCEL
											</v-btn>
											<v-btn
												v-if="reviewMode"
												class="clickable"
												flat
												@click="saveReviews"
												color="primary">
												SAVE
											</v-btn>
											<v-btn
												v-if="!reviewMode"
												:disabled="!batchSelect.name"
												class="clickable"
												flat
												@click="filterDialog = true"
												color="primary">
												FILTER
											</v-btn>
											<v-btn
												v-if="!reviewMode"
												:disabled="throttled || indexedPracs.length === 0"
												class="clickable"
												flat
												@click="downloadFiles"
												color="primary">
												DOWNLOAD FILES
											</v-btn>
											<v-btn
												v-if="!reviewMode"
												:disabled="indexedPracs.length === 0"
												class="clickable"
												color="primary"
												@click="activateReviews"
												flat>
												REVIEW
											</v-btn>
										</td>
									</template>
								</v-data-table>
								<v-dialog v-model="filterDialog" persistent max-width="700px">
									<v-card>
										<v-card-title style="padding-bottom: 0">
											<span class="headline">Filters</span>
										</v-card-title>
										<v-card-text>
											<v-container grid-list-md>
												<v-flex xs12 sm6 md4>
													<span class="subheading">View By</span>
													<v-radio-group
														v-model="viewBy">
														<v-radio
															label="Practical"
															value="prac"
															color="primary">
														</v-radio>
														<v-radio
															label="Enrolment number"
															value="eno"
															color="primary">
														</v-radio>
													</v-radio-group>
												</v-flex>
												<v-flex
													xs12 sm7 md6
													v-if="viewBy === 'prac'">
													<v-select
														v-model="filteredPrac"
														:items="list"
														label="Practical"
														item-text="name"
														item-value="id"
														box
														clearable>
													</v-select>
												</v-flex>
												<v-flex
													class="enroll-wrap"
													xs12 sm12 md12
													v-else>
													<!-- <v-text-field
														v-model="enrollSlider"

														class="mb-0 wrap-left"
														type="number"
														step="1"
														hide-details
														single-line>
													</v-text-field> -->
													<v-slider
														class="mt-4 mr-3 ml-2"
														v-model="enrollSlider"
														@wheel.native="enrollScroll"
														:min="minEnroll"
														:max="maxEnroll"
														step="1"
														color="primary"
														ticks="always"
														tick-size="2"
														thumb-label="always"
														hint="Scroll or drag the thumb to change value"
														persistent-hint
														always-dirty>
													</v-slider>
												</v-flex>
											</v-container>
										</v-card-text>
										<v-card-actions>
											<v-spacer></v-spacer>
											<v-btn color="blue darken-1" flat @click.native="clearFilter">CLEAR</v-btn>
											<v-btn color="blue darken-1" flat @click="applyFilter">APPLY</v-btn>
										</v-card-actions>
									</v-card>
								</v-dialog>
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
							</v-flex>
						</v-layout>
					</v-container>
				</main>
			</v-tab-item>
		</v-tabs-items>
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
				offsetTop: 0,
				tabs: ["Practicals", "Submissions"],
				tabModel: 'tab-0',
				listHeaders: [
					{
						text: 'Practical No.',
						align: 'right',
						sortable: false,
						value: 'id'
					},
					{
						text: 'Practical Name',
						align: 'center',
						sortable: false,
						value: 'name'
					},
					{
						text: 'Deadline',
						align: 'center',
						sortable: false,
						value: 'deadline'
					},
					{
						text: 'Edit',
						align: 'center',
						sortable: false,
						value: 'edit'
					}
				],
				listLoader: false,
				deadlineDialog: false,
				timeMenu: false,
				editedIndex: -1,
				editedItem: {
					id: '',
					name: '',
					deadline: ''
				},
				defaultItem: {
					id: '',
					name: '',
					deadline: ''
				},
				inputtedDate: null,
				inputtedTime: null,
				practicalHeaders: [
					{
						text: 'Enrolment No.',
						align: 'center',
						sortable: false,
						value: 'id'
					},
					{
						text: 'Practical No.',
						align: 'right',
						sortable: false,
						value: 'e_no'
					},
					{
						text: 'Practical Name',
						align: 'center',
						sortable: false,
						value: 'name'
					},
					{
						text: 'Status',
						align: 'center',
						sortable: false,
						value: 'status'
					}
				],
				pagination: {},
				pracLoader: false,
				selected: [],
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
				throttled: false,
				reviewMode: false,
				reviewPracs: undefined,
				batchSelect: {},
				batches: [
					{
						id: 1,
						name: 'E1',
						range: '1-25'
					},
					{
						id: 2,
						name: 'E2',
						range: '26-47'
					},
					{
						id: 3,
						name: 'E3',
						range: '48-67'
					}
				],
				list: [],
				filterDialog: false,
				viewBy: 'prac',
				filteredPrac: undefined,
				enrollSlider: this.maxEnroll,
				minEnroll: 1,
				maxEnroll: 25,
				pracDialog: {
					open: false,
					title: '',
					code: '',
					isImage: false,
					imageSrc: '',
					loading: false,
				},
				snackbar: false,
				snackbarMessage: '',
				snackbarColor: '',
				rowsPerPageItems: [
					5,
					10,
					{
						"text": "$vuetify.dataIterator.rowsPerPageAll",
						"value": -1
					}
				],
				uuids: undefined
			}
		},

		methods: {
			downloadFiles() {
				if (this.selected.length <= 0) {
					this.showSnackbar('primary', 'No practicals selected');
					return;
				}
				this.throttled = true;
				setTimeout(() => {
					this.throttled = false;
				}, 20000);
				this.$refs.dummyinput.value = JSON.stringify(this.selected);
				this.$refs.dummyform.submit();
			},

			editItem(item) {
				this.editedIndex = this.list.indexOf(item);
				this.editedItem = Object.assign({}, item);
				this.deadlineDialog = true;
			},

			async handshake(deadline) {
				try {
					let res = await fetch('/secure/practicals/deadline', {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						credentials: 'same-origin',
						body: JSON.stringify({
							subject: this.$store.state.username.slice(3).toLowerCase(),
							deadline: deadline,
							pracid: this.editedItem.id
						})
					});
					res = await res.json();
					if (res.code === 200) {
						this.showSnackbar("success", res.message);
						this.editedItem.deadline = this.deadlineString(deadline);
						this.commit();
					} else {
						this.showSnackbar("error", res.message);
					}
				} catch(error) {
					this.showSnackbar("error", "Error updating deadline");
				}
				this.resetDefault();
				this.listLoader = false;
			},

			save() {
				if (Boolean(this.inputtedDate) !== Boolean(this.inputtedTime)) {
					this.close();
					this.showSnackbar("error", "Invalid timestamp");
					return;
				}
				this.deadlineDialog = false;
				this.listLoader = true;
				if (!this.inputtedDate) {
					this.handshake('');
					return;
				}
				const [year, month, day] = this.inputtedDate.split('-').map(it => Number(it));
				const [hours, mins] = this.inputtedTime.split(':').map(it => Number(it));
				const millis = new Date(year, month - 1, day, hours, mins).getTime();
				this.handshake(millis);
			},

			deadlineString(millis) {
				if (!millis) {
					return millis;
				}
				const date = new Date(Number(millis)).toString();
				return date.slice(0, date.lastIndexOf(':00')).replace(' 2018', ',');
			},

			commit() {
				Object.assign(this.list[this.editedIndex], this.editedItem);
			},

			close() {
				this.deadlineDialog = false;
				this.resetDefault();
			},

			resetDefault() {
				this.inputtedDate = null;
				this.inputtedTime = null;
				this.editedItem = Object.assign({}, this.defaultItem);
				this.editedIndex = -1;
			},

			openPracDialog(item) {
				this.pracDialog.title = `${item.name} - ${item.e_no}`;
				let prop = '';
				if (item.id > 5) {
					this.pracDialog.isImage = true;
					prop = 'imageSrc';
				} else {
					this.pracDialog.isImage = false;
					prop = 'code';
				}
				this.pracDialog.open = true;
				this.pracDialog.loading = true;
				const content = this.$store.state.practicals[this.batchSelect.name][item.uuid].content;
				if (content) {
					this.pracDialog.loading = false;
					this.pracDialog[prop] = content;
					return;
				}
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
				}).then(res => res.json())
				  .then(res => {
					  	this.pracDialog.loading = false;
						this.pracDialog[prop] = res.content;
						this.$store.commit({
							type: 'updateContent',
							content: res.content,
							uuid: item.uuid,
							batch: this.batchSelect
						});
				  });
			},

			closePracDialog() {
				this.pracDialog.open = false;
				this.pracDialog.loading = false;
				this.pracDialog.content = '';
				this.pracDialog.imageSrc = '';
			},

			changeStatus(item, newStatus) {
				const index = this.reviewPracs.findIndex(prac => prac.uuid === item.uuid);
				if (this.reviewPracs[index].status === newStatus) {
					return;
				}
				this.$set(this.reviewPracs, index, {
					...item,
					status: newStatus
				});
				this.uuids.add(index);
			},

			activateReviews() {
				this.showSnackbar('primary', 'Review mode: ON');
				this.reviewMode = true;
				this.reviewPracs = [...this.$store.getters.filtered(this.batchSelect)];
				this.uuids = new Set();
			},

			cancelReviews() {
				this.reviewMode = false;
				this.reviewPracs = undefined;
				this.uuids = undefined;
			},

			async saveReviews() {
				if (this.uuids.size === 0) {
					this.cancelReviews();
					return;
				}
				this.pracLoader = true;
				try {
					let res = await fetch('/secure/practicals/update/status', {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						credentials: 'same-origin',
						body: JSON.stringify({
							subject: this.$store.state.username.slice(3).toLowerCase(),
							updations: [...this.uuids].map(i => {
								const { id: pracid, e_no, status } = this.reviewPracs[i];
								return { pracid, e_no, status };
							})
						})
					});
					res = await res.json();
					if (res.code === 200) {
						this.showSnackbar("success", res.message);
						this.$store.commit({
							type: 'updateStatii',
							batch: this.batchSelect,
							statii: [...this.uuids].map(i => {
								const { uuid, status } = this.reviewPracs[i];
								return { uuid, status };
							})
						});
					} else {
						this.showSnackbar("error", res.message);
					}
				} catch(error) {
					this.showSnackbar("error", "Error updating status(es)");
				}
				this.cancelReviews();
				this.pracLoader = false;
			},

			batchChange(batch) {
				this.pagination.page = 1;
				[this.minEnroll, this.maxEnroll]
					= batch.range.split('-').map(each => Number(each));
				this.enrollSlider = this.maxEnroll;
				this.$store.commit('resetFilter');
			},

			enrollScroll(e) {
				if (e.deltaY > 0) {
					this.enrollSlider--;
				} else {
					this.enrollSlider++;
				}
			},

			applyFilter() {
				this.pagination.page = 1;
				this.filterDialog = false;
				if (this.viewBy === 'prac') {
					if (this.filteredPrac === undefined) {
						this.batchChange(this.batchSelect);
						return;
					}
					this.$store.commit({
						type: 'updatePracticalFilter',
						pracid: this.filteredPrac
					});
				} else {
					this.$store.commit({
						type: 'updateEnrolFilter',
						enroll: this.enrollSlider,
					});
				}
			},

			clearFilter() {
				this.pagination.page = 1;
				this.filterDialog = false;
				this.viewBy = 'prac';
				this.filteredPrac = undefined;
				this.batchChange(this.batchSelect);
			},

			showSnackbar(color, message) {
				this.snackbarColor = color;
				this.snackbarMessage = message;
				this.snackbar = true;
			},

			onLogout() {
				document.cookie = 'FiletLog=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				this.$router.push('/login');
				this.$store.commit('resetState');
			},

			inRange(enroll, start, end) {
				const raw = Number(enroll.slice(-2));
				return start <= raw && raw <= end;
			}
		},

		watch: {
			tabModel(val) {
				if (val === 'tab-1' && !this.batchSelect.name) {
					this.pracLoader = true;
					fetch('/secure/practicals/submitted', {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						credentials: 'same-origin',
						body: JSON.stringify({
							subject: this.$store.state.username.slice(3).toLowerCase()
						})
					}).then(res => res.json())
					  .then(practicals => {
							this.$store.commit({
								type: 'setPracticals',
								batch: 'E1',
								data: practicals.filter(prac => this.inRange(prac.e_no, 1, 25))
												.map((prac, index) => ({
													uuid: index,
													...prac
												}))
							});
							this.$store.commit({
								type: 'setPracticals',
								batch: 'E2',
								data: practicals.filter(prac => this.inRange(prac.e_no, 26, 47))
												.map((prac, index) => ({
													uuid: index,
													...prac
												}))
							});
							this.$store.commit({
								type: 'setPracticals',
								batch: 'E3',
								data: practicals.filter(prac => this.inRange(prac.e_no, 48, 67))
												.map((prac, index) => ({
													uuid: index,
													...prac
												}))
							});
							this.pracLoader = false;
					  });
				}
			}
		},

		computed: {
    		indexedPracs() {
				return this.$store.getters.filtered(this.batchSelect);
    		}
  		},

		mounted: async function() {
			this.listLoader = true;
			if (this.$route.params.id !== this.$store.state.username) {
				this.$router.replace(`/student/${this.$store.state.username}`);
			}
			fetch('/secure/practicals/list', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					subject: this.$store.state.username.slice(3).toLowerCase()
				})
			}).then(res => res.json())
			  .then(list => {
				  this.list = list.map(item => ({
					  ...item,
					  deadline: this.deadlineString(item.deadline)
				  }));
				  this.listLoader = false;
			  });
		}
	}
</script>

<style scoped>
	.batch-select {
		margin: 0 auto;
	}

	.dummy {
		display: none;
	}

	.clickable {
		cursor: pointer;
	}

	td {
		white-space: nowrap;
	}

	.default-cursor {
		cursor: default;
	}

	.code {
		font-family: 'Roboto Mono';
		white-space: pre-wrap;
	}

	.eye-cursor {
		cursor: url('./eye.svg'), pointer;
	}

	.full {
		min-height: 100%;
	}

	/* .enroll-wrap {
		display: flex;
	}

	.wrap-left {
		flex-basis: 7%;
		margin-top: -4px;
	}

	.wrap-right {
		flex-basis: 93%;
	} */
</style>
