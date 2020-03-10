<script>
import { mapGetters } from "vuex"
import LoadingFailModal from "~/components/popups/LoadingFailure.vue"
import TestTable from "~/components/TestTable.vue"
const rowsPerPage = 10

export default {
  layout: "admin",
  components: {
    LoadingFailModal,
    TestTable,
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
    async getTests ({ page = this.pagination.page } = {}) {
      this.isLoading = true
      await this.$store.dispatch("test/fetchTests", { page, limit: rowsPerPage })
      this.isLoading = false
    },
    onRefreshClicked () {
      this.getTests({ page: 1 })
      this.pagination.page = 1
    },
  },
}
</script>

<template>
<div id="team-manage">
  <loading-fail-modal :isOpen.sync="isLoadingFail" :onReload="getTests"></loading-fail-modal>

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
  <TestTable/>
</div>
</template>
