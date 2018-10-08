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
						v-for="(item, index) in overflowItems"
						:key="index"
						@click="onLogout">
						<v-list-tile-title>{{ item.title }}</v-list-tile-title>
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
				id="tab-0"
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
									:rows-per-page-items="rowsPerPageItems"
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
				id="tab-1"
				key="1">
				<main>
					<v-container fill-height>
						<v-layout align-center justify-center>
							<v-flex xs12 lg8 xl8>
								<v-flex class="batch-select" xs12 sm6 md6 lg6 xl4>
									<v-select
										ref="batchSelect"
										v-model="batchSelect"
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
									no-data-text="No matching results found"
									:loading="pracLoader"
									:items="indexedPracs"
									item-key="uuid"
									:rows-per-page-items="rowsPerPageItems"
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
										<td class="text-xs-center">{{ props.item.e_no }}</td>
										<td class="text-xs-right">{{ props.item.id }}</td>
										<td class="text-xs-center">{{ props.item.name }}</td>
										<!-- <td class="text-xs-center">
											<template v-if="reviewMode">
												<v-icon
													v-for="(status, i) in statuses"
													:key="i"
													:color="props.item.status === i ? status.color : 'rgba(33, 33, 33, 0.3)'"
													@click="changeStatus(props.item, i)">
													{{ status.icon }}
												</v-icon>
											</template>
											<template v-else>
												<v-icon :color="statuses[props.item.status].color">
													{{ statuses[props.item.status].icon }}
												</v-icon>
											</template>
										</td> -->
									</template>
									<template slot="footer">
										<td colspan="100%" class="text-xs-right">
											<!-- <v-btn
												v-if="reviewMode"
												class="clickable"
												flat
												@click="cancelReviews"
												color="primary">
												Cancel
											</v-btn>
											<v-btn
												v-if="reviewMode"
												class="clickable"
												flat
												@click="saveReviews"
												color="primary">
												Save
											</v-btn> -->
											<v-btn
												:disabled="indexedPracs.length === 0"
												class="clickable"
												flat
												@click="filterDialog = true"
												color="primary">
												FILTER
											</v-btn>
											<v-btn
												:disabled="throttled || indexedPracs.length === 0"
												class="clickable"
												flat
												@click="downloadFiles"
												color="primary">
												Download files
											</v-btn>
											<!-- <v-btn
												v-if="!reviewMode"
												:disabled="indexedPracs.length === 0"
												class="clickable"
												color="primary"
												@click="activateReviews"
												flat>
												REVIEW
											</v-btn> -->
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
													xs12 sm6 md4
													v-if="viewBy === 'prac'">
													<v-select
														v-model="filteredPrac"
														:items="list"
														label="Practical"
														item-text="name"
														item-value="id"
														box>
													</v-select>
												</v-flex>
												<v-flex
													xs12 sm12 md12
													v-else>
													<v-range-slider
														class="mt-4 mr-3 ml-3"
														v-model="enrollSlider"
														:min="minEnroll"
														:max="maxEnroll"
														step="1"
														color="primary"
														ticks="always"
														tick-size="2"
														thumb-label="always"
														hint="Overlap both thumbs to select single value"
														persistent-hint>
													</v-range-slider>
												</v-flex>
											</v-container>
										</v-card-text>
										<v-card-actions>
											<v-spacer></v-spacer>
											<v-btn color="blue darken-1" flat @click.native="cancelFilter">CANCEL</v-btn>
											<v-btn color="blue darken-1" flat @click="applyFilter">APPLY</v-btn>
										</v-card-actions>
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
					}
					// {
					// 	text: 'Status',
					// 	align: 'center',
					// 	sortable: false,
					// 	value: 'status'
					// }
				],
				pracLoader: false,
				selected: [],
				// statuses: [
				// 	{
				// 		icon: 'check_circle',
				// 		color: 'success'
				// 	},
				// 	{
				// 		icon: 'remove_circle',
				// 		color: 'primary'
				// 	},
				// 	{
				// 		icon: 'cancel',
				// 		color: 'error'
				// 	}
				// ],
				throttled: false,
				// reviewMode: false,
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
				filteredPrac: -1,
				enrollSlider: [1, 25],
				minEnroll: 1,
				maxEnroll: 25,
				snackbar: false,
				snackbarMessage: '',
				snackbarColor: '',
				overflowItems: [
					{ title: 'Logout' }
				],
				rowsPerPageItems: [
					10,
					25,
					{
						"text": "$vuetify.dataIterator.rowsPerPageAll",
						"value": -1
					}
				]
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

			// changeStatus(item, i) {
			// 	Object.assign(this.indexedPracs[item.uuid], {
			// 		...item,
			// 		status: i
			// 	});
			// },

			// activateReviews() {
			// 	this.reviewMode = true;
			// },

			// cancelReviews() {
			// 	this.reviewMode = false;
			// },

			// saveReviews() {
			// 	this.reviewMode = false;
			// },

			batchChange(batch) {
				[this.minEnroll, this.maxEnroll]
					= batch.range.split('-').map(each => Number(each));
				this.enrollSlider = [this.minEnroll, this.maxEnroll];
				this.$store.commit('resetFilter');
			},

			applyFilter() {
				this.filterDialog = false;
				if (this.viewBy === 'prac') {
					if (this.filteredPrac === -1) {
						this.batchChange(this.batchSelect);
						return;
					}
					this.$store.commit({
						type: 'updatePracticalFilter',
						pracid: this.filteredPrac
					});
				} else {
					if (this.enrollSlider[0] === this.minEnroll
						&& this.enrollSlider[1] === this.maxEnroll) {
						this.batchChange(this.batchSelect);
						return;
					}
					this.$store.commit({
						type: 'updateEnrolFilter',
						start: this.enrollSlider[0],
						end: this.enrollSlider[1]
					});
				}
			},

			cancelFilter() {
				this.filterDialog = false;
				this.viewBy = 'prac';
				this.enrollSlider = [this.minEnroll, this.maxEnroll];
				this.filteredPrac = -1;
			},

			showSnackbar(color, message) {
				this.snackbarColor = color;
				this.snackbarMessage = message;
				this.snackbar = true;
			},

			onLogout() {
				document.cookie = 'FiletLog=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
				this.$store.commit('update', {
					prefix: '',
					username: ''
				});
				this.$router.push('/login');
			},

			inRange(enroll, start, end) {
				const raw = Number(enroll.slice(-2));
				return start <= raw && raw <= end;
			}
		},

		watch: {
			tabModel(val) {
				if (val === 'tab-1' && Object.keys(this.batchSelect).length === 0) {
					this.pracLoader = true;
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
      			if (Object.keys(this.batchSelect).length === 0) {
					return [];
				}
				if (!this.$store.state.filter.type) {
					return this.$store.state.practicals[this.batchSelect.name];
				}
				if (this.$store.state.filter.type === 'prac') {
					return this.$store.state.practicals[this.batchSelect.name]
											.filter(prac => prac.id === this.$store.state.filter.pracid);
				} else {
					return this.$store.state.practicals[this.batchSelect.name]
											.filter(prac => this.inRange(prac.e_no,
																		 this.$store.state.filter.start,
																		 this.$store.state.filter.end));
				}
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
</style>
