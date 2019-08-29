<script>
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      password: "",
      confirmPassword: "",
      currentPassword: "",
      eye: false,
      passwordRules: [
        v => !!v || "Password is required",
        v => (v && v.length >= 8) || "Name must be less than 8 characters",
      ],
      confirmPasswordRules: [
        v => !!v || "Confirm password is required",
        v => v === this.password || "Confirmation password doesn't match",
      ],
    }
  },
  computed: {
    dialog: {
      get () {
        return this.isShow
      },
      set (x) {
        this.$emit("update:isShow", x)
      },
    },
  },
  methods: {
    onCancelClicked () {
      this.reset()
      this.dialog = false
    },
    async onSubmitClicked () {
      const isFormValid = this.$refs.form.validate()
      if (isFormValid) {
        const data = {
          password: this.password,
          currentPassword: this.currentPassword,
        }
        this.$emit("changePassword", data)
      }
    },
    reset () {
      this.$refs.form.reset()
      this.currentPassword = ""
      this.password = ""
      this.confirmPassword = ""
    },
  },
}
</script>

<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">Change Password</v-card-title>
      <v-card-text class="pt-0">
        <v-form ref="form" name="change-password-form" lazy-validation>
          <v-text-field
            v-model="currentPassword"
            :type="eye ? 'text' : 'password'"
            label="Current Password"
            :rules="[v => !!v || 'Current password is required']"
            name="password"
            required />

          <v-text-field
            v-model="password"
            :append-icon="eye ? 'visibility_off' : 'visibility'"
            :type="eye ? 'text' : 'password'"
            name="newPassword"
            label="New Password"
            :rules="passwordRules"
            persistent-hint
            hint="Password must be 8 alphanumeric characters"
            required
            @click:append="() => (eye = !eye)" />

          <v-text-field
            v-model="confirmPassword"
            :type="eye ? 'text' : 'password'"
            label="Re-type password"
            :rules="confirmPasswordRules"
            name="confirmPassword"
            required />
        </v-form>
      </v-card-text>

      <v-card-actions class="py-3 mx-1">
        <v-spacer/>
        <v-btn @click="onCancelClicked">
          Cancel
        </v-btn>
        <v-btn :loading="isLoading" color="primary" @click="onSubmitClicked">
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.headline {
  color: #1db5b7;
  padding-bottom: 0;
}
.desc-title {
  margin-bottom: 15px;
}
</style>
