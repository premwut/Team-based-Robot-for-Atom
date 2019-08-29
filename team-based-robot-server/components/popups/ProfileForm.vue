<script>
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
    user: {
      immediate: true,
      handler (val) {
        this.isEditing = val !== undefined
        this.editingId = val.usr_id
        this.formData = { ...val }
      },
    },
  },
  methods: {
    clearAction () {
      this.isEditing = false
      this.editingId = undefined
      this.$refs.form.reset()
      this.$emit("update:isOpen", false)
    },
    onCancelButtonClicked () {
      this.clearAction()
    },
    async onSaveButtonClicked () {
      try {
        if (this.$refs.form.validate()) {
          this.isLoading = true
          const data = { ...this.formData }
          await this.$store.dispatch("user/editProfile", data)
          await this.$store.dispatch("fetchProfile")
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
        <v-card-title class="headline">Edit Profile</v-card-title>

        <v-card-text class="py-0">
          <v-form id="profile-form" v-model="formValid" ref="form" lazy-validation>
            <v-container grid-list-xs>
              <v-layout row>
                  <v-flex xs6 class="mx-2">
                    <v-text-field label="E-mail"
                      id="email" type="text" v-model="formData.email"
                      :disabled="true"
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
