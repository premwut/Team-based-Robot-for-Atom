<script>
import { mapGetters } from "vuex"
import SelectionList from "~/components/SelectionList.vue"

export default {
  layout: "admin",
  components: {
    SelectionList,
  },
  async fetch ({ store }) {
    try {
      const isMemberEmpty = store.state.team.members.length === 0
      const isRoleEmpty = store.state.role.roles.length === 0
      let { team_id = 1 } = store.state.currentUser || {}
      team_id = team_id === null ? 1 : team_id
      isMemberEmpty && (await store.dispatch("team/fetchMember", team_id))
      const process = [store.dispatch("user/fetchMemberUsers")]
      isRoleEmpty && process.push(store.dispatch("role/fetchRoles"))
      await Promise.all(process)
    } catch (error) {
      console.log("[Fetch] Error ", error)
    }
  },
  data () {
    return {
      isLoading: false,
      breadcrumbs: [
        { text: "Team Management", disabled: false },
        { text: "Team Member", disabled: true },
      ],
      userItems: [],
      teamItems: [],
    }
  },
  computed: {
    ...mapGetters({
      userMembers: "user/getUserMembers",
      teamMembers: "team/getMembers",
      teamLeaderRole: "role/getTeamLeaderRole",
    }),
    enableLeftButton () {
      const itemSelected = this.teamItems.filter(x => x.selected)
      return itemSelected.length > 0
    },
    enableRightButton () {
      const itemSelected = this.userItems.filter(x => x.selected)
      return itemSelected.length > 0
    },
  },
  watch: {
    teamMembers: {
      immediate: true,
      handler (value) {
        if (Array.isArray(value)) {
          const filterTeamLoader = x => x.role_id !== this.teamLeaderRole.role_id
          this.teamItems = value.map(x => ({ ...x, selected: false })).filter(filterTeamLoader)
        }
      },
    },
    userMembers: {
      immediate: true,
      handler (value) {
        if (Array.isArray(value)) {
          const teamMemberIds = this.teamMembers.map(x => x.usr_id)
          const filterCurrentUser = x => !teamMemberIds.includes(x.usr_id)
          this.userItems = value.map(x => ({ ...x, selected: false })).filter(filterCurrentUser)
        }
      },
    },
  },
  methods: {
    clearSelected (items) {
      items.forEach(item => {
        item.selected = false
      })
    },
    async onSaveClicked () {
      try {
        this.isLoading = true
        const getUserId = x => x.usr_id
        const memberIds = this.teamMembers.map(getUserId)
        const currentIds = this.teamItems.map(getUserId)
        const addFilter = x => !memberIds.includes(x.usr_id)
        const removeFilter = x => !currentIds.includes(x.usr_id) && x.role_id !== this.teamLeaderRole.role_id
        const addMembers = this.teamItems.filter(addFilter).map(getUserId)
        const removeMembers = this.teamMembers.filter(removeFilter).map(getUserId)
        const { team_id } = this.$store.state.currentUser
        await this.$store.dispatch("team/saveMembers", { team_id, addMembers, removeMembers })
        this.isLoading = false
        this.$store.dispatch("showNotify", "Save member successfully")
      } catch (error) {
        this.isLoading = false
        this.$store.dispatch("showNotify", "Save member failure")
      }
    },
    onClearSelectedClicked () {
      this.clearSelected(this.teamItems)
      this.clearSelected(this.userItems)
    },
    onTeamSelectionUpdating () {
      this.clearSelected(this.userItems)
    },
    onUserSelectionUpdating () {
      this.clearSelected(this.teamItems)
    },
    onLeftButtonClicked () {
      const memberSelected = this.teamItems.filter(x => x.selected)
      if (memberSelected.length > 0) {
        this.userItems = this.userItems.concat(memberSelected)
        this.teamItems = this.teamItems.filter(x => !x.selected)
        this.onClearSelectedClicked()
      }
    },
    onRightButtonClicked () {
      const memberSelected = this.userItems.filter(x => x.selected)
      if (memberSelected.length > 0) {
        this.teamItems = this.teamItems.concat(memberSelected)
        this.userItems = this.userItems.filter(x => !x.selected)
        this.onClearSelectedClicked()
      }
    },
  },
}
</script>

<template>
<div id="team-member-page">

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
  </v-layout>

  <v-flex md12 class="mt-2">
    <v-layout row wrap justify-space-between>
      <v-flex md4>
        <v-card height="500">
          <selection-list itemKey="usr_id" title="User List"
            v-model="userItems"
            @change="onUserSelectionUpdating">
            <template slot-scope="{ item }">
              {{ item.usr_fname }} {{ item.usr_lname }}
            </template>
          </selection-list>
        </v-card>
      </v-flex>
      <v-flex md2>
        <div class="action-wrapper">
          <v-btn class="arrow-button" fab color="primary"
            :disabled="!enableLeftButton" @click="onLeftButtonClicked">
            <v-icon>keyboard_arrow_left</v-icon>
          </v-btn>
          <v-btn class="arrow-button" fab color="primary"
            :disabled="!enableRightButton" @click="onRightButtonClicked">
            <v-icon>keyboard_arrow_right</v-icon>
          </v-btn>
          <v-btn class="clear-button" round outline color="error" @click="onClearSelectedClicked">
            Clear Selected
          </v-btn>
          <v-btn class="save-button" round outline @click="onSaveClicked" color="primary" :loading="isLoading">
            <v-icon>save</v-icon>&nbsp;&nbsp;Save
          </v-btn>
        </div>
      </v-flex>
      <v-flex md4>
        <v-card height="500">
          <selection-list itemKey="usr_id" title="Team Members"
            v-model="teamItems"
            @change="onTeamSelectionUpdating">
            <template slot-scope="{ item }">
              {{ item.usr_fname }} {{ item.usr_lname }}
            </template>
          </selection-list>
        </v-card>
      </v-flex>
    </v-layout>
  </v-flex>

</div>
</template>

<style lang="scss" scoped>
.action-wrapper {
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 80%;
  .arrow-button {
    margin-top: 1.5rem;
  }
  .clear-button {
    margin-top: 3rem;
    width: 160px;
  }
  .save-button {
    margin-top: 1rem;
    width: 160px;
  }
}
</style>
