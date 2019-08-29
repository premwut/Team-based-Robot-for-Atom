<script>
import { mapGetters } from "vuex"
import LoadingFailModal from "~/components/popups/LoadingFailure.vue"
import TeamFormModal from "~/components/popups/TeamForm.vue"
const rowsPerPage = 10

export default {
  layout: "admin",
  components: {
    LoadingFailModal,
    TeamFormModal,
  },
  async fetch ({ store }) {
    try {
      this.isLoading = true
      const isTeamEmpty = store.state.team.teams.list.length === 0
      const isProjectEmpty = store.state.project.allProject.length === 0
      const process = []
      isTeamEmpty && process.push(store.dispatch("team/fetchTeams", { page: 1, limit: rowsPerPage }))
      isProjectEmpty && process.push(store.dispatch("project/fetchAllProject"))
      await Promise.all(process)
      this.isLoading = false
    } catch (error) {
      this.isLoading = false
      this.isLoadingFail = true
    }
  },
  data: () => ({
    isLoadingFail: false,
    isOpenTeamForm: false,
    isConfirmDelete: false,
    isDeleting: false,
    isLoading: false,
    showError: false,
    errorMessage: "",
    breadcrumbs: [
      { text: "Team Management", disabled: false },
      { text: "Team List", disabled: true },
    ],
    headers: [
      { text: "Team ID", align: "center", sortable: false },
      { text: "Team Name", align: "left", sortable: false },
      { text: "Project", align: "left", sortable: false },
      { text: "Actions", align: "center", sortable: false },
    ],
    pagination: { rowsPerPage },
    editedItem: undefined,
    deleteItem: undefined,
  }),
  computed: {
    paging () {
      return {
        rowsPerPage: this.teams.limit,
        totalItems: this.teams.total,
      }
    },
    isAllowUpdate () {
      let isAllow = false
      const features = this.$store.state.features
      features.forEach(item => {
        const isMatchFeature = item.feature === "MANAGE_TEAM"
        const isMatchPermission = item.permission === "WRITE"
        const isMatch = isMatchFeature && isMatchPermission
        const isAllowAll = item.feature === "ALL"
        if (isMatch || isAllowAll) {
          isAllow = true
        }
      })
      return isAllow
    },
    ...mapGetters({
      teams: "team/getTeams",
    }),
  },
  watch: {
    pagination: {
      handler (paging) {
        this.getTeams(paging)
      },
    },
  },
  methods: {
    async getTeams ({ page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("team/fetchTeams", { page, limit: rowsPerPage })
      this.isLoading = false
    },
    onRefreshClicked () {
      this.getTeams({ page: 1 })
      this.pagination.page = 1
    },
    onEditItemClicked (item) {
      this.editedItem = {...item}
      this.isOpenTeamForm = !this.isOpenTeamForm
    },
    onDeleteItemClicked (item) {
      this.deleteItem = {...item}
      this.isConfirmDelete = true
    },
    async onConfirmDeleteClicked () {
      this.isDeleting = true
      const res = await this.$store.dispatch("team/deleteTeam", { ...this.deleteItem })
      this.isDeleting = false
      this.isConfirmDelete = false
      this.deleteItem = {}
      if (res instanceof Error) {
        this.showError = true
        this.errorMessage = "Delete Team failure."
      }
    },
  },
}
</script>

<template>
<div id="team-manage">
  <loading-fail-modal :isOpen.sync="isLoadingFail" :onReload="getTeams"></loading-fail-modal>
  <team-form-modal :isOpen.sync="isOpenTeamForm" :team.sync="editedItem"></team-form-modal>

  <v-layout row wrap>
    <v-flex xs8>
      <v-breadcrumbs class="px-0">
        <v-icon slot="divider">chevron_right</v-icon>
        <v-breadcrumbs-item v-for="item in breadcrumbs"
          :key="item.text" :disabled="item.disabled">
          {{ item.text }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>
    </v-flex>
    <v-flex xs4>
      <v-card-actions class="px-0">
        <v-spacer></v-spacer>
        <v-btn id="btn-reload" color="primary" @click="onRefreshClicked" :loading="isLoading">
          <v-icon>refresh</v-icon> Reload
        </v-btn>
        <v-btn id="btn-new-user" color="primary" class="mr-0" @click="isOpenTeamForm = !isOpenTeamForm">
          <v-icon>add</v-icon> New Team
        </v-btn>
      </v-card-actions>
    </v-flex>
  </v-layout>
  <v-flex md12>
    <div class="table-container">
      <v-data-table id="user-table-container"
        :headers="headers" :items="teams.list"
        :loading="isLoading"
        :pagination.sync="pagination"
        :total-items="paging.totalItems"
        :rows-per-page-items="[10]"
        class="elevation-1">
        <v-progress-linear slot="progress" color="primary" height="3" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.team_id }}</td>
          <td class="text-xs-left">{{ props.item.team_name }}</td>
          <td class="text-xs-left">
            <span v-if="props.item.project">{{ props.item.project.proj_name }}</span>
          </td>
          <td class="justify-center layout px-0">
            <v-btn :id="'edit-row-' + props.index" icon class="mx-0" @click="onEditItemClicked(props.item)"
              :disabled="!isAllowUpdate">
              <v-icon color="teal">edit</v-icon>
            </v-btn>
            <v-btn :id="'delete-row-' + props.index" icon class="mx-0" @click="onDeleteItemClicked(props.item)"
              :disabled="!isAllowUpdate">
              <v-icon color="pink">delete</v-icon>
            </v-btn>
          </td>
        </template>
        <template slot="no-data">
          <div>
            <h2 class="text-xs-center my-5">No Team Data!</h2>
          </div>
        </template>
      </v-data-table>

      <v-dialog v-model="isConfirmDelete" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">Confirm to Delete</v-card-title>
          <v-card-text class="pt-0">Are you sure to delete this item?</v-card-text>
          <v-card-actions class="mt-2">
            <v-spacer></v-spacer>
            <v-btn flat @click="isConfirmDelete = !isConfirmDelete">Cancel</v-btn>
            <v-btn dark color="red lighten-1" @click="onConfirmDeleteClicked"
              :loading="isDeleting">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar :timeout="5000" color="error" :top="true" :right="true" v-model="showError">
        {{ errorMessage }}
        <v-btn flat @click.native="showError = false">Close</v-btn>
      </v-snackbar>
    </div>
  </v-flex>
</div>
</template>
