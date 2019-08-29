<template>
  <v-layout class="mt-5" align-start justify-center>
    <v-flex class="mt-5" xs12 sm8 md4>
      <v-card id="login-block" class="elevation-12">
        <v-toolbar dark color="primary">
          <v-spacer></v-spacer>
          <v-toolbar-title class="mx-0">Team-Based Robot Administrator</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="formValid" ref="form" @submit.prevent="onLoginClicked" lazy-validation>
            <v-text-field prepend-icon="person" name="login" label="Username"
              id="username" type="text" v-model="username"
              autofocus
              :rules="usernameRules" required>
            </v-text-field>
            <v-text-field prepend-icon="lock" name="password" label="Password"
              id="password" v-model="password"
              :rules="passwordRules"
              :append-icon="eye ? 'visibility_off' : 'visibility'"
              :type="eye ? 'text' : 'password'"
              required
              @click:append="() => (eye = !eye)"
            >
            </v-text-field>
            <v-card-actions class="px-0">
              <v-spacer></v-spacer>
              <v-btn id="login-btn" type="submit" color="primary"
                :loading="loading"
                :disabled="!formValid">Login</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
      <v-snackbar id="notify-error-box" :timeout="5000" :top="true" :right="true" v-model="showError">
        <div class="notify-error-text">
          Login Failure.
        </div>
        <v-btn flat color="primary" @click.native="showError = false">Close</v-btn>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  layout: "fullpage",
  data: () => ({
    username: "",
    password: "",
    eye: false,
    formValid: false,
    loading: false,
    showError: false,
    usernameRules: [
      v => !!v || "Username is required",
      v => (v && v.length >= 5) || "Username must be less than 5 characters",
    ],
    passwordRules: [
      v => !!v || "Password is required",
      v => (v && v.length >= 5) || "Password must be less than 5 characters",
    ],
  }),
  methods: {
    async onLoginClicked (e) {
      try {
        // e.preventDefault()
        if (this.$refs.form.validate()) {
          this.loading = true
          await this.$store.dispatch("login", { username: this.username, password: this.password })
          this.loading = false
          const token = this.$cookies.cookies["auth.token"]
          if (token) {
            this.$router.push("/admin")
          }
        }
      } catch (error) {
        this.loading = false
        this.showError = true
      }
    },
  },
}
</script>
