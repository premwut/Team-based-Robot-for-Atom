<template>
  <div id="testcase-table">
    <v-flex md12>
        <H1>This is Testcase Table</H1>
        <!-- {{ testcases.list }} -->
        
        <!-- <li v-for="item in testcases.list.tc_list" :key="item">
        {{ item }}
        </li>
        <li v-for="item in testcases.list.kwd_list" :key="item">
        {{ item }}
        </li> -->
        <div class="table-container">
          <v-data-table id="user-table-container"
          :headers="headers" :items="testcases.list"
          :loading="isLoading"
          :pagination.sync="pagination"
          :total-items="paging.totalItems"
          :rows-per-page-items="[10]"
          class="elevation-1">
          <v-progress-linear slot="progress" color="primary" height="3" indeterminate></v-progress-linear>
              <template slot="items" slot-scope="props">
                  <td class="text-xs-center">{{ changeDateFormat(props.item.created_at) }}</td>
                  <td class="text-xs-center">{{ props.item.tc_id }}</td>
                  <td class="text-xs-center">{{ props.item.tc_name }}</td>
                  <td class="text-xs-center">{{ props.item.tc_passed }}</td>
              </template>
              <template slot="no-data">
                  <div>
                      <h2 class="text-xs-center my-5">No Testcase Data!</h2>
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
      const isTestcaseEmpty = store.state.test.testcases.list.length === 0
      console.log("isTestcaseEmpty", isTestcaseEmpty)
      console.log(this.isLoading, "isLoading")
      isTestcaseEmpty && process.push(store.dispatch("test/fetchTestcases", { page: 1, limit: rowsPerPage }))
      await Promise.all(process)
      this.isLoading = false
      console.log("isLoading ===>", this.isLoading)
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
      { text: "Keyword List", disabled: false },
    ],
    headers: [
      { text: "Date", align: "center", sortable: false },
      { text: "Testcase ID", align: "center", sortable: false },
      { text: "Testcase Name", align: "center", sortable: false },
      { text: "Executed Result", align: "center", sortable: false },
    ],
    pagination: { rowsPerPage },
    editedItem: undefined,
    deleteItem: undefined,
  }),
  computed: {
    paging () {
      return {
        rowsPerPage: this.testcases.limit,
        totalItems: this.testcases.total,
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
      testcases: "test/getTestcases",
    }),
  },
  watch: {
    pagination: {
      handler (paging) {
        this.getTestcases(paging)
      },
    },
  },
  methods: {
    changeDateFormat (date) {
      let formatted_date = moment(new Date(date)).format("L")
      return formatted_date
    },
    async getTestcases ({ item, page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("test/fetchTestcases", { item, page, limit: rowsPerPage })
      this.isLoading = false
    },
  },
}
</script>

<style>

</style>