<template>
  <div id="keyword-table">
    <v-flex md12>
      <!-- Debug -->
        <!-- <H1>This is Keyword Table</H1> -->
        <!-- {{ testKeywords.list }} -->
        <!-- <li v-for="item in testKeywords.list" :key="item.kwd_id">
        {{ item }}
        </li> -->
  
        <div class="table-container">
          <v-data-table id="user-table-container"
          :headers="headers" :items="testKeywords.list"
          :loading="isLoading"
          :pagination.sync="pagination"
          :total-items="paging.totalItems"
          :rows-per-page-items="[10]"
          class="elevation-1">
          <v-progress-linear slot="progress" color="primary" height="3" indeterminate></v-progress-linear>
              <template slot="items" slot-scope="props">
                <tr @click="onKeywordClick(props.item)">
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
        </div>

  </v-flex>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import LoadingFailModal from "~/components/popups/LoadingFailure.vue"
const rowsPerPage = 10

export default {
  components: {
    LoadingFailModal,
  },
  // async fetch ({ store }) {
  //   try {
  //     this.isLoading = true
  //     const process = []
  //     const isKeywordEmpty = store.state.test.keywords.list.length === 0
  //     console.log("isTestcaseEmpty", isKeywordEmpty)
  //     console.log(this.isLoading, "isLoading")
  //     isKeywordEmpty && process.push(store.dispatch("test/fetchKeywords", { tc_id: 1, page: 1, limit: rowsPerPage }))
  //     await Promise.all(process)
  //     this.isLoading = false
  //   } catch (error) {
  //     this.isLoading = false
  //     this.isLoadingFail = true
  //   }
  // },
  data: () => ({
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
      { text: "Keyword List", disabled: true, tableName: "KeywordTable" },
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
        rowsPerPage: this.testKeywords.limit,
        totalItems: this.testKeywords.total,
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
      testKeywords: "test/getKeywords",
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
    onRefreshClicked () {
      this.getKeywords({ page: 1 })
      this.pagination.page = 1
    },
    async getKeywords ({ page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("test/fetchKeywords", { page, limit: rowsPerPage })
      this.isLoading = false
    },
    async onKeywordClick (item) {
      console.log(`kwd_id = ${item.kwd_id}\nkwd_name = ${item.kwd_name}`)
      // alert(`kwd_id = ${item.kwd_id}\nkwd_name = ${item.kwd_name}`)
    },
  },
}
</script>

<style>

</style>