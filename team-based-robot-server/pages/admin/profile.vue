<script>
import { mapGetters } from "vuex"
import ChangePassword from "~/components/popups/ChangePassword.vue"
import ProfileFormModal from "~/components/popups/ProfileForm.vue"

export default {
  layout: "admin",
  components: {
    ChangePassword,
    ProfileFormModal,
  },
  data () {
    return {
      isLoading: false,
      showChangePassword: false,
      showEditProfile: false,
    }
  },
  computed: {
    ...mapGetters({
      user: "getCurrentUser",
    }),
  },
  methods: {
    onChangePasswordClicked () {
      this.showChangePassword = true
    },
    onEditProfileClicked () {
      this.showEditProfile = true
    },
    async changePassword (data) {
      this.isLoading = true
      try {
        await this.$store.dispatch("changePassword", data)
        this.isLoading = false
        this.$refs.changePassword.reset()
        this.showChangePassword = false
        this.$store.dispatch("showNotify", "Change password successfully")
      } catch (error) {
        this.isLoading = false
        this.$refs.changePassword.reset()
        this.showChangePassword = false
        this.$store.dispatch("showNotify", "Change password failure")
      }
    },
  },
}
</script>

<template>
  <div id="profile-page">
    <v-flex>
      <v-card class="pa-4">
        <h3 class="mb-1">User Infomation</h3>
        <v-divider />
        <div class="py-4">
          <table v-if="user !== undefined" class="table-info">
            <tbody>
              <tr>
                <td>Username</td>
                <td>{{ user.username || "-" }}</td>
              </tr>
              <tr>
                <td>Password</td>
                <td>
                  ********** &nbsp;&nbsp;&nbsp;
                  <v-btn class="ma-0" flat fab small @click="onChangePasswordClicked">
                    <v-icon color="primary">edit</v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr>
                <td>E-mail</td>
                <td>{{ user.email || "-" }}</td>
              </tr>
              <tr>
                <td>Name</td>
                <td>
                  {{ user.usr_fname }} {{ user.usr_lname }} &nbsp;&nbsp;&nbsp;
                  <v-btn class="ma-0" flat fab small @click="onEditProfileClicked">
                    <v-icon color="primary">edit</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card>

      <profile-form-modal
        :isOpen.sync="showEditProfile"
        :user="user"
      />

      <change-password
        ref="changePassword"
        :is-show.sync="showChangePassword"
        :is-loading="isLoading"
        @changePassword="changePassword"
      />
    </v-flex>
  </div>
</template>

<style lang="scss" scoped>
table {
  border: none;
  border-spacing: 0;
  border-collapse: collapse;
  td,
  th {
    border: none;
    border-spacing: 0;
    border-collapse: collapse;
    padding: 6px 15px;
    border: 1px solid #e3ebf3;
  }
}
.table-info {
  width: 100%;
  tr {
    height: 50px;
  }
  tr td:first-child {
    width: 20%;
    font-weight: 500;
  }
}
</style>
