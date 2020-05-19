<script>
import { mapGetters } from "vuex"
import LoadingFailModal from "~/components/popups/LoadingFailure.vue"
import KeywordDetailModal from "~/components/popups/KeywordDetail.vue"
const rowsPerPage = 10

export default {
  layout: "admin",
  components: {
    LoadingFailModal,
    KeywordDetailModal,
  },
  async fetch ({ store }) {
    try {
      this.isLoading = true
      const process = []
      const isKeywordEmpty = store.state.keyword.keywords.list.length === 0
      isKeywordEmpty && process.push(store.dispatch("keyword/fetchKeywords", { page: 1, limit: rowsPerPage }))
      await Promise.all(process)
      this.isLoading = false
    } catch (error) {
      this.isLoading = false
      this.isLoadingFail = true
    }
  },
  data: () => ({
    isLoadingFail: false,
    isOpenKeywordDetail: false,
    isConfirmDelete: false,
    isDeleting: false,
    isLoading: false,
    showError: false,
    errorMessage: "",
    statusIcon: {
      "Pending": { color: "yellow darken-2", icon: "watch_later" },
      "Approved": { color: "blue lighten-2", icon: "thumb_up" },
      "Refused": { color: "red lighten-2", icon: "thumb_down" },
    },
    breadcrumbs: [
      { text: "Keyword Management", disabled: false },
      { text: "Keyword List", disabled: true },
    ],
    headers: [
      { text: "Keyword ID", align: "center", sortable: false },
      { text: "Keyword Name", align: "left", sortable: false },
      { text: "Keyword Description", align: "left", sortable: false },
      { text: "Keyword Review", align: "center", sortable: false },
      { text: "Actions", align: "center", sortable: false },
    ],
    pagination: { rowsPerPage },
    editedItem: undefined,
    deleteItem: undefined,
  }),
  computed: {
    paging () {
      return {
        rowsPerPage: this.keywords.limit,
        totalItems: this.keywords.total,
      }
    },
    isAdmin () {
      let isAdmin = false
      const features = this.$store.state.features
      features.forEach(item => {
        const isAllowAll = item.feature === "ALL"
        if (isAllowAll) {
          isAdmin = true
        }
      })
      return isAdmin
    },
    ...mapGetters({
      keywords: "keyword/getKeywords",
    }),
  },
  watch: {
    pagination: {
      handler (paging) {
        this.getKeywords(paging)
      },
    },
  },
  methods: {
    async getKeywords ({ page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("keyword/fetchKeywords", { page, limit: rowsPerPage })
      this.isLoading = false
    },
    onRefreshClicked () {
      this.getKeywords({ page: 1 })
      this.pagination.page = 1
    },
    onInfoItemClicked (item) {
      this.editedItem = {...item}
      this.isOpenKeywordDetail = !this.isOpenKeywordDetail
    },
    onDeleteItemClicked (item) {
      this.deleteItem = {...item}
      this.isConfirmDelete = true
    },
    async onConfirmDeleteClicked () {
      this.isDeleting = true
      const res = await this.$store.dispatch("keyword/deleteKeyword", { ...this.deleteItem })
      this.isDeleting = false
      this.isConfirmDelete = false
      this.deleteItem = {}
      if (res instanceof Error) {
        this.showError = true
        this.errorMessage = "Delete Project failure."
      }
    },
  },
}
</script>

<template>
<div id="team-manage">
  <loading-fail-modal :isOpen.sync="isLoadingFail" :onReload="getKeywords"></loading-fail-modal>
  <keyword-detail-modal :isOpen.sync="isOpenKeywordDetail" :keyword="editedItem"></keyword-detail-modal>

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
      </v-card-actions>
    </v-flex>
  </v-layout>
  <v-flex md12>
    <div class="table-container">
      <v-data-table id="user-table-container"
        :headers="headers" :items="keywords.list"
        :loading="isLoading"
        :pagination.sync="pagination"
        :total-items="paging.totalItems"
        :rows-per-page-items="[10]"
        class="elevation-1">
        <v-progress-linear slot="progress" color="primary" height="3" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.kwd_id }}</td>
          <td class="text-xs-left">{{ props.item.kwd_name }}</td>
          <td class="text-xs-left">{{ props.item.kwd_desc }}</td>
          <td class="text-xs-center">
          <v-icon class="ma-2" :color="statusIcon[props.item.kwd_review.rw_status].color">
            {{ statusIcon[props.item.kwd_review.rw_status].icon }}
          </v-icon>
          </td>
          <td class="justify-center layout px-0">
            <v-btn :id="'edit-row-' + props.index" icon class="mx-0" @click="onInfoItemClicked(props.item)"
              :disabled="false">
              <v-icon color="teal">info</v-icon>
            </v-btn>
            <v-btn :id="'delete-row-' + props.index" icon class="mx-0" @click="onDeleteItemClicked(props.item)"
              :disabled="!(isAdmin || props.item.isOwner)">
              <v-icon color="pink">delete</v-icon>
            </v-btn>
          </td>
        </template>
        <template slot="no-data">
          <div>
            <h2 class="text-xs-center my-5">No Keyword Data!</h2>
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
