<script>
import LoadingFailModal from "~/components/popups/LoadingFailure.vue"
import TestTable from "~/components/TestTable.vue"
import TestcaseTable from "~/components/TestcaseTable.vue"
import KeywordTable from "~/components/KeywordTable.vue"
const rowsPerPage = 10

export default {
  layout: "admin",
  components: {
    LoadingFailModal,
    TestTable,
    TestcaseTable,
    KeywordTable,
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
    tableName: "TestTable",
    isLoadingFail: false,
    isOpenKeywordDetail: false,
    isConfirmDelete: false,
    isDeleting: false,
    isLoading: false,
    showError: false,
    errorMessage: "",
    breadcrumbs: [
      { text: "Executed result", disabled: false, tableName: "TestTable" },
      // { text: "Testcase List", disabled: false, tableName: "TestcaseTable" },
      // { text: "Keyword List", disabled: false, tableName: "KeywordTable" },
    ],
    headers: [
      { text: "Testcase ID", align: "center", sortable: false },
      { text: "Testcase Name", align: "center", sortable: false },
      { text: "Start", align: "center", sortable: false },
      { text: "End", align: "center", sortable: false },
      { text: "Duration", align: "center", sortable: false },
      { text: "Run Date", align: "center", sortable: false },
      { text: "Run Result", align: "center", sortable: false },
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
  },
  watch: {
    pagination: {
      handler (paging) {
        this.getTests(paging)
      },
    },
  },
  methods: {
    async getTests ({ page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("test/fetchTests", { page, limit: rowsPerPage })
      this.isLoading = false
    },
    async getTestcases ({ item, page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("test/fetchTestcases", { item, page, limit: rowsPerPage })
      this.isLoading = false
    },
    onRefreshClicked () {
      this.getTests({ page: 1 })
      this.pagination.page = 1
    },
    changeTable (dataObj) {
      const { tableName, breadcrumbs } = dataObj
      this.tableName = tableName
      this.breadcrumbs = breadcrumbs
    },
    breadcrumbSelected (tableName) {
      console.log("Breadcrumb is clicked!!", tableName)
      let bcIdx = -1
      this.breadcrumbs.map((item, idx) => {
        if (item.tableName === tableName) { bcIdx = idx + 1 }
      })
      console.log(`tableName = ${tableName}, idx = ${bcIdx}`)
      this.breadcrumbs = this.breadcrumbs.slice(0, bcIdx)
      this.tableName = tableName
    },
  },
}
</script>

<template>
<div id="team-manage">
  <loading-fail-modal :isOpen.sync="isLoadingFail" :onReload="getTests"></loading-fail-modal>
  <v-layout row wrap>
    <v-flex xs8>

      <v-breadcrumbs divider=">" class="px-0">
        <v-breadcrumbs-item v-for="item in breadcrumbs"
          :key="item.text" :disabled="item.disabled">
          <div @click="breadcrumbSelected(item.tableName)">
            {{ item.text }}
          </div>
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
  <component @changeTable="changeTable" :is="tableName"></component>
</div>
</template>
