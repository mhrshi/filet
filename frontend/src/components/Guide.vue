<template>
	<v-app>
		<v-toolbar prominent>
		<v-toolbar-title class="headline">Guide</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-btn to="/" color="primary" outline>HOME</v-btn>
    </v-toolbar>
	<main>
		<v-container fill-height>
			<v-layout align-center>
				<v-treeview
					:items="branches"
					:active.sync="activeNode"
					expand-icon="expand_more"
					active-class="primary--text"
					activatable
					open-all
					open-on-click
					transition>
				</v-treeview>
			</v-layout>
		</v-container>
		<v-container fill-height>
			<v-layout column>
				<div class="title pb-3">Faculty Dashboard</div>
				<v-divider id="branch-1-1" class="pt-3"></v-divider>
				<div class="subheading font-weight-medium">Set/Reset deadline</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Switch to the <span class="font-italic uline">Practicals</span> tab</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Click the edit button for any practical</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">&ndash;</span>To set a deadline: pick date &amp; time and save</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">&ndash;</span>To reset the deadline: leave date &amp; time empty and save</p>
				</div>
				<div id="branch-1-2" class="mt-4 subheading font-weight-medium">Filters</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2">Filters can be used to filter out certain practicals or enrolment numbers from full list of submissions.</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Switch to the <span class="font-italic uline">Submissions</span> tab and select any batch</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Click the <span class="font-italic uline">Filter</span> button at bottom of the table</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">&ndash;</span>View by practical: select any practical from the provided dropdown and apply</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">&ndash;</span>View by enrolment number: scroll or drag the slider thumb to select a number and apply</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">&ndash;</span>Clear filters: click on the <span class="font-italic uline">Clear</span> button</p>
				</div>
				<div id="branch-1-3" class="mt-4 subheading font-weight-medium">Inline practical view</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2">This will let you view any submission without actually downloading the file by yourself.</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Switch to the <span class="font-italic uline">Submissions</span> tab and select any batch</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Click the <span class="font-italic uline">Practical Name</span> of any submission (hint: your cursor will change to an eye)</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">3.</span>A dialog will open showing the file's content (image/text)</p>
				</div>
				<div id="branch-1-4" class="mt-4 subheading font-weight-medium">Download practical(s)</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2">This will let you download any/all files submitted.</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Switch to the <span class="font-italic uline">Submissions</span> tab and select any batch</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Select the checkboxes in-line of any/all submissions you would like to download</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">3.</span>Click the <span class="font-italic uline">Download Files</span> button at bottom of the table</p>
				</div>
				<div id="branch-1-5" class="mt-4 subheading font-weight-medium">Review mode</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2">In this mode, you will be able to change the status of any submission. There are 3 modes of status:</p>
					<p class="mb-2 icon-text"><v-icon class="mr-2" color="success">check_circle</v-icon><span class="uplift">Accepted</span></p>
					<p class="mb-2 icon-text"><v-icon class="mr-2" color="primary">remove_circle</v-icon><span class="uplift">Pending</span></p>
					<p class="mb-2 icon-text"><v-icon class="mr-2" color="error">cancel</v-icon><span class="uplift">Rejected</span></p>
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Switch to the <span class="font-italic uline">Submissions</span> tab and select any batch</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Click the <span class="font-italic uline">Review</span> button at bottom of the table to enter review mode</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">3.</span>Change any/all submission status by selecting one of the 3 modes</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">4.</span>Click save</p>
				</div>
				<div class="title mt-5 pb-3">Student Dashboard</div>
				<v-divider id="branch-2-1" class="pt-3"></v-divider>
				<div class="subheading font-weight-medium">Submit practical</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Upload file to your Drive</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Right click file <span class="subheading px-1">&#x279D;</span> Get shareable link</p>
					<v-img
						class="my-3"
						src="/static/sharing_settings.png"
						max-width="500">
					</v-img>
					<p class="mb-2"><span class="font-weight-medium mr-2">3.</span>Sharing settings <span class="subheading px-1">&#x279D;</span> Advanced</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">4.</span>Under <span class="font-italic uline">Who has access</span> click <span class="font-italic uline primary--text">Change...</span></p>
					<v-img
						class="my-3"
						src="/static/link_access.png"
						max-width="500">
					</v-img>
					<p class="mb-2"><span class="font-weight-medium mr-2">5.</span>Select <span class="font-italic uline">On - Anyone with the link</span> and save the choice</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">6.</span>Click <span class="font-italic uline">Done</span></p>
					<p class="mb-2"><span class="font-weight-medium mr-2">7.</span>Again, right click the file <span class="subheading px-1">&#x279D;</span> Get shareable link</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">8.</span>Now the link will be automatically copied to clipboard</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">9.</span>Go to Filet, click the edit button for your respective practical</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">10.</span>Paste the link in the box provided and save</p>
				</div>
				<div id="branch-2-2" class="mt-4 subheading font-weight-medium">Remove submitted practical</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Click the edit button for your respective practical</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Empty the box (erase file ID) and save</p>
				</div>
				<div id="branch-2-3" class="mt-4 subheading font-weight-medium">Update practical</div>
				<div class="body-1 pl-3 pt-3">
					<p class="mb-2"><span class="font-weight-medium mr-2">1.</span>Locate the practical's previous file in your Drive</p>
					<p class="mb-2"><span class="font-weight-medium mr-2">2.</span>Right click <span class="subheading px-1">&#x279D;</span> Manage versions <span class="subheading px-1">&#x279D;</span> Upload new version</p>
					<p class="mb-2">After uploading a new version you can safely delete the older one. There is no need to make any changes in Filet as the file ID of the new version remains unchanged.</p>
				</div>
			</v-layout>
		</v-container>
	</main>
	</v-app>
</template>

<script>
	export default {
		name: 'Guide',
		data() {
			return {
				branches: [
					{
						id: 1,
						name: 'Faculty Dashboard',
						children: [
							{ id: 1.1, name: 'Set/Reset deadline' },
							{ id: 1.2, name: 'Filters' },
							{ id: 1.3, name: 'Inline practical view' },
							{ id: 1.4, name: 'Download practical(s)' },
							{ id: 1.5, name: 'Review mode' }
						]
					},
					{
						id: 2,
						name: 'Student Dashboard',
						children: [
							{ id: 2.1, name: 'Submit practical' },
							{ id: 2.2, name: 'Remove submitted practical' },
							{ id: 2.3, name: 'Update practical' }
						]
					}
				],
				activeNode: undefined
			}
		},

		watch: {
			activeNode(val) {
				if (val.length !== 0) {
					const id = String(val[0]);
					this.$vuetify.goTo(`#branch-${id[0]}-${id[2]}`);
				}
			}
		}
	}
</script>

<style scoped>
	.uline {
		text-decoration: underline;
	}

	.icon-text {
		display: table;
	}

	.uplift {
		display: table-cell;
		vertical-align: middle;
	}
</style>
