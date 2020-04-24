<template>
  <div id="test-table">
    <v-flex md12>
      <!-- Debug -->
        <!-- <H1>This is Test Table</H1> -->
        <!-- {{ tests.list }} -->
        <!-- <li v-for="item in tests.list" :key="item">
        {{ item }} <br>
        </li> -->

    <div class="table-container">
      <v-data-table id="user-table-container"
        :headers="headers" :items="tests.list"
        :loading="isLoading"
        :pagination.sync="pagination"
        :total-items="paging.totalItems"
        :rows-per-page-items="[10]"
        class="elevation-1">
        <v-progress-linear slot="progress" color="primary" height="3" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="props">
          <tr @click="onTestClick(props.item.test_id)">
          <td class="text-xs-center">{{ changeDateFormat(props.item.created_at) }}</td>
          <td class="text-xs-center">{{ props.item.usr_id }}</td>
          <td class="text-xs-center">{{ props.item.test_id }}</td>
          <td class="text-xs-center">{{ props.item.test_tc_no }}</td>
          <td class="text-xs-center">{{ props.item.test_passed }}</td>
          <td class="text-xs-center">{{ props.item.test_failed }}</td>
          <td class="text-xs-center">
            <a @mouseover="downloadHover = true" @mouseleave="downloadHover = false" 
            :href="props.item.test_file_link" target="_bank">Link</a>
          </td>
        </tr>
        </template>
        <template slot="no-data">
          <div>
            <h2 class="text-xs-center my-5">No Test Data!</h2>
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
import moment from "moment"
const rowsPerPage = 10
export default {
  components: {
    LoadingFailModal,
  },
  async fetch ({ store }) {
    try {
      this.isLoading = true
      const process = []
      const isTestEmpty = store.state.test.tests.list.length === 0
      console.log("isTestEmpty", isTestEmpty)
      console.log(this.isLoading, "isLoading")
      isTestEmpty && process.push(store.dispatch("test/fetchTests", { page: 1, limit: rowsPerPage }))
      await Promise.all(process)
      this.isLoading = false
      console.log("isLoading ===>", this.isLoading)
    } catch (error) {
      this.isLoading = false
      this.isLoadingFail = true
    }
  },
  data: () => ({
    downloadHover: false,
    isLoadingFail: false,
    isOpenKeywordDetail: false,
    isConfirmDelete: false,
    isDeleting: false,
    isLoading: false,
    showError: false,
    errorMessage: "",
    breadcrumbs: [
      { text: "Executed result", disabled: false, tableName: "TestTable" },
      { text: "Testcase List", disabled: true, tableName: "TestcaseTable" },
      // { text: "Keyword List", disabled: true, tableName: "KeywordTable" },
    ],
    headers: [
      { text: "Date", align: "center", sortable: false },
      { text: "Executor ID", align: "center", sortable: false },
      { text: "Executed ID", align: "center", sortable: false },
      { text: "Number of Testcases", align: "center", sortable: false },
      { text: "Number of Passed", align: "center", sortable: false },
      { text: "Number of Failed", align: "center", sortable: false },
      { text: "Download", align: "center", sortable: false },
    ],
    pagination: { rowsPerPage },
    editedItem: undefined,
    deleteItem: undefined,
  }),
  computed: {
    paging () {
      return {
        rowsPerPage: this.tests.limit,
        totalItems: this.tests.total,
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
      tests: "test/getTests",
    }),
  },
  watch: {
    pagination: {
      handler (paging) {
        this.getTests(paging)
      },
    },
  },
  methods: {
    onRefreshClicked () {
      this.getTests({ page: 1 })
      this.pagination.page = 1
    },
    changeDateFormat (date) {
      let formatted_date = moment(new Date(date)).format("L")
      return formatted_date
    },
    addHttpInUrl (url) {
      return "https://" + url.toString()
    },
    async getTests ({ page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("test/fetchTests", { page, limit: rowsPerPage })
      this.isLoading = false
    },
    async onTestClick (test_id) {
      if (this.downloadHover) return
      const page = this.pagination.page
      this.isLoading = true
      console.log(`[event method] test_id ==> ${test_id}`)
      await this.$store.dispatch("test/fetchTestcases", { test_id, page, limit: rowsPerPage })
      this.isLoading = false
      this.$emit("changeTable", {
        tableName: "TestcaseTable",
        breadcrumbs: this.breadcrumbs,
      })
    },
  },
}
</script>

<style>

</style>