<template>
  <div id="keyword-table">
    <v-flex md12>
      <!-- Debug -->
        <H1>This is Keyword Table</H1>
        <!-- {{ keywords.list }} -->
        <li v-for="item in keywords.list" :key="item">
        {{ item }} <br>
        </li>
  
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
                <tr @click="onKeywordClick(props.item.kwd_id)">
                  <td class="text-xs-center">{{ props.item.kwd_id || "No ID" }}</td>
                  <td class="text-xs-center">{{ props.item.kwd_name || "No Name"}}</td>
                </tr>
              </template>
              <template slot="no-data">
                  <div>
                      <h2 class="text-xs-center my-5">No Keyword Data!</h2>
                  </div>
              </template>
          </v-data-table>
          <v-snackbar :timeout="5000" color="error" :top="true" :right="true" v-model="showError">
            {{ errorMessage }}
            <v-btn flat @click.native="showError = false">Close</v-btn>
          </v-snackbar>
        </div>
  </v-flex>
  </div>
</template>

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
      const isKeywordEmpty = store.state.test.keywords.list.length === 0
      isKeywordEmpty && process.push(store.dispatch("test/fetchKeywords", { page: 1, limit: rowsPerPage }))
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
    breadcrumbs: [
      { text: "Executed result", disabled: false },
      { text: "Testcase List", disabled: false },
      { text: "Keyword List", disabled: true },
    ],
    headers: [
      { text: "Keyword ID", align: "center", sortable: false },
      { text: "Keyword Name", align: "center", sortable: false },
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
      keywords: "test/getKeywords",
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
      await this.$store.dispatch("test/fetchKeywords", { tc_id: 1, page, limit: rowsPerPage })
      this.isLoading = false
    },
  },
}
</script>

<style>

</style>