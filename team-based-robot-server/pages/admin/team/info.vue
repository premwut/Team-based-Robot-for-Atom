<script>
import { mapGetters } from "vuex"

export default {
  layout: "admin",
  async fetch ({ store }) {
    try {
      const process = []
      const isMemberEmpty = store.state.team.members.length === 0
      const isRoleEmpty = store.state.role.roles.length === 0
      const isProjectEmpty = store.state.project.allProject.length === 0
      const isCurrentTeamEmpty = store.state.currentTeam === undefined
      let { team_id = 1 } = store.state.currentUser || {}
      team_id = team_id === null ? 1 : team_id
      if (isMemberEmpty && isCurrentTeamEmpty) {
        await Promise.all([
          store.dispatch("team/fetchMember", team_id),
          store.dispatch("fetchCurrentTeam", team_id),
        ])
      } else {
        isMemberEmpty && (await store.dispatch("team/fetchMember", team_id))
        isCurrentTeamEmpty && (await store.dispatch("fetchCurrentTeam", team_id))
      }
      isRoleEmpty && process.push(store.dispatch("role/fetchRoles"))
      isProjectEmpty && process.push(store.dispatch("project/fetchAllProject"))
      await Promise.all(process)
    } catch (error) {
      console.log("[Fetch] Error ", error)
    }
  },
  data () {
    return {
      isLoading: false,
      formValid: false,
      breadcrumbs: [
        { text: "Team Management", disabled: false },
        { text: "Team Information", disabled: true },
      ],
      currentProject: {},
      teamName: "",
    }
  },
  computed: {
    ...mapGetters({
      teamMembers: "team/getMembers",
      teamLeaderRole: "role/getTeamLeaderRole",
      projects: "project/getAllProject",
      currentTeam: "getCurrentTeam",
    }),
  },
  mounted () {
    this.intervalId = setInterval(() => {
      if (this.currentTeam) {
        this.updateInformation()
        clearInterval(this.intervalId)
      }
    }, 200)
  },
  methods: {
    updateInformation (team_name = this.currentTeam.team_name, proj_id = this.currentTeam.proj_id) {
      this.teamName = team_name
      const [project] = this.projects.filter(x => x.proj_id === proj_id)
      if (project) {
        this.currentProject = project
      }
    },
    onSaveClicked () {
      if (this.$refs.form.validate()) {
        const { proj_id } = this.currentProject
        const { team_id } = this.$store.state.currentUser
        const team_name = this.teamName
        this.saveTeamInfo({ team_id, team_name, proj_id })
      }
    },
    async saveTeamInfo (data) {
      try {
        this.isLoading = true
        const team = await this.$store.dispatch("team/saveTeam", data)
        this.updateInformation(team.team_name, team.proj_id)
        this.isLoading = false
        this.$store.dispatch("showNotify", "Save team information successfully")
      } catch (error) {
        this.isLoading = false
        this.$store.dispatch("showNotify", "Save team information failure")
      }
    },
    onEditMemberClicked () {
      this.$router.push("/admin/team/member")
    },
  },
}
</script>

<template>
<div id="team-information-page">

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
    <v-card>
      <v-layout row wrap justify-space-between>
        <v-flex md12>
          <v-list>
            <v-list-tile>
              <v-list-tile-title class="title">
                Team Information
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-flex>
        <v-flex md5 class="info-block">
          <v-form id="team-info-form" v-model="formValid" ref="form" lazy-validation>
            <v-container grid-list-xs>
              <v-layout row>
                  <v-flex xs12 class="mx-2">
                    <v-text-field label="Team Name"
                      id="team-name" type="text" v-model="teamName"
                      :rules="[v => !!v || 'Team name is required']" required>
                    </v-text-field>
                  </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 class="mx-2">
                  <v-autocomplete id="team-project" label="Work on project"
                    v-model="currentProject"
                    :items="projects"
                    item-text="proj_name"
                    item-value="proj_id"
                    return-object
                    autocomplete></v-autocomplete>
                </v-flex>
              </v-layout>
              <v-layout class="mt-3" row justify-end>
                <v-btn id="btn-save-form"
                  color="primary"
                  :loading="isLoading"
                  @click.prevent="onSaveClicked">
                  <v-icon>save</v-icon>&nbsp;&nbsp;Save
                </v-btn>
              </v-layout>
            </v-container>
          </v-form>
        </v-flex>

        <v-flex md5 class="members-block">
          <v-layout row class="header-list">
            <v-subheader class="pr-0">Members</v-subheader>
            <v-btn class="edit-member-button" flat color="primary" @click="onEditMemberClicked">
              <v-icon>edit</v-icon>
            </v-btn>
          </v-layout>
          <div class="member-list">
            <div v-for="item in teamMembers" :key="`${item.usr_id}`"
              class="member-item"
              @click="onItemClicked(item)">
              <div class="title-wrapper">
                <div class="name">
                  {{ item.usr_fname }} {{ item.usr_lname }}
                </div>
                <div class="role">
                  <template v-if="teamLeaderRole.role_id === item.role_id">
                    (Team Leader)
                  </template>
                  <template v-else>
                    (Team Member)
                  </template>
                </div>
              </div>
            </div>
          </div>
        </v-flex>
      </v-layout>
    </v-card>
  </v-flex>
</div>
</template>

<style lang="scss" scoped>
.info-block {
  margin: 0 0 15px 15px;
  border: 1px solid #dddddd;
}
.members-block {
  margin: 0 15px 15px 0;
  border: 1px solid #dddddd;
  .header-list {
    border-bottom: 1px solid #dddddd;
  }
  .member-list {
    display: flex;
    flex-flow: column wrap;
    margin: 10px 0;
    min-height: 360px;
    overflow-y: scroll;
    overflow-y: -moz-scrollbars-none;
    &::-webkit-scrollbar {
      display: none;
      width: 0px;
    }

    .member-item {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      height: 44px;
      padding: 0 15px;
      &:hover {
        background-color: lighten($color: #dddddd, $amount: 10);
      }
      .title-wrapper {
        display: flex;
        flex-flow: row wrap;
        width: 100%;
        .name {
          flex: auto;
          user-select: none;
          font-weight: bold;
          text-transform: capitalize;
        }
        .role {
          width: 30%;
          user-select: none;
        }
      }
    }
  }
}
</style>
