<script>
import { mapGetters } from "vuex"

export default {
  props: ["isOpen", "user"],
  data: () => ({
    show: false,
    formValid: false,
    isEditing: false,
    isLoading: false,
    editingId: undefined,
    formData: {},
    emailRules: [
      v => !!v || "E-mail is required",
      v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || "E-mail must be valid",
    ],
  }),
  watch: {
    isOpen (val) {
      this.show = val
    },
    user (userValue) {
      if (userValue) {
        this.isEditing = userValue !== undefined
        this.editingId = userValue.usr_id
        this.formData = userValue
      }
    },
  },
  computed: {
    ...mapGetters({
      teams: "team/getAllTeam",
      roles: "role/getRolesWithoutAdmin",
    }),
  },
  methods: {
    clearAction () {
      this.isEditing = false
      this.editingId = undefined
      this.$refs.form.reset()
      this.$emit("update:isOpen", false)
      this.$emit("update:user", undefined)
    },
    onCancelButtonClicked () {
      this.clearAction()
    },
    async onSaveButtonClicked () {
      try {
        if (this.$refs.form.validate()) {
          this.isLoading = true
          const action = this.isEditing ? "user/editUser" : "user/createUser"
          const { team_id = null } = this.formData.team || {}
          const { role_id = null } = this.formData.role || {}
          const data = { ...this.formData, team_id, role_id, usr_id: this.editingId }
          if (!this.isEditing) data.password = data.username // TODO: comment this line, if you want to send email for set password
          delete data.team
          delete data.role
          await this.$store.dispatch(action, data)
          this.clearAction()
          this.isLoading = false
        }
      } catch (error) {
        console.log("error ", error)
        this.clearAction()
        this.isLoading = false
      }
    },
  },
}
</script>

<template>
  <v-layout row justify-center>
    <v-dialog v-model="show" max-width="600" persistent>
      <v-card>
        <v-card-title class="headline">{{ isEditing ? 'Edit' : 'Create' }} User</v-card-title>

        <v-card-text class="py-0">
          <v-form id="user-form" v-model="formValid" ref="form" lazy-validation>
            <v-container grid-list-xs>
              <v-layout row>
                  <v-flex xs6 class="mx-2">
                    <v-text-field label="E-mail"
                      id="email" type="text" v-model="formData.email"
                      :rules="emailRules" required autofocus>
                    </v-text-field>
                  </v-flex>
                  <v-flex xs6 class="mx-2">
                    <v-text-field label="Username"
                      id="username" type="text" v-model="formData.username"
                      :rules="[v => !!v || 'Username is required']" :disabled="isEditing" required>
                    </v-text-field>
                  </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs6 class="mx-2">
                  <v-text-field label="Firstname"
                    id="firstName" type="text" v-model="formData.usr_fname"
                    :rules="[v => !!v || 'Firstname is required']" required>
                  </v-text-field>
                </v-flex>
                <v-flex xs6 class="mx-2">
                  <v-text-field label="Lastname"
                    id="lastName" type="text" v-model="formData.usr_lname"
                    :rules="[v => !!v || 'Lastname is required']" required>
                  </v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 class="mx-2">
                  <v-autocomplete id="team" label="Team"
                    v-model="formData.team"
                    :items="teams"
                    item-text="team_name"
                    item-value="team_id"
                    return-object
                    autocomplete></v-autocomplete>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 class="mx-2">
                  <v-autocomplete id="role" label="Role"
                    v-model="formData.role"
                    :items="roles"
                    item-text="role_title"
                    item-value="role_id"
                    return-object
                    autocomplete></v-autocomplete>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-3 py-3">
          <v-spacer></v-spacer>
          <v-btn id="btn-cancel-form" flat
            @click.prevent="onCancelButtonClicked">
            Cancel
          </v-btn>
          <v-btn id="btn-save-form"
            color="primary"
            :loading="isLoading"
            @click.prevent="onSaveButtonClicked">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
