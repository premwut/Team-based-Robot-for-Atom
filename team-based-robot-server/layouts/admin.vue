
<script>
import AppSidebar from "~/components/Sidebar.vue"
import AppFooter from "~/components/Footer.vue"
import { mapGetters } from "vuex"

export default {
  middleware: ["auth", "visit"],
  transition: "bounce",
  components: {
    AppSidebar,
    AppFooter,
  },
  data: () => ({
    drawer: true,
  }),
  computed: {
    ...mapGetters({
      notify: "getNotify",
    }),
  },
  beforeMount () {
    this.$store.dispatch("updateAxiosAuthorization")
  },
  methods: {
    onMenuClicked (menu) {
      switch (menu) {
        case "logout":
          this.$store.dispatch("logout")
          this.$router.push("/login")
          break
        case "profile":
          this.$router.push("/admin/profile")
          break
      }
    },
    onOpenNotifyChanged (isShow) {
      if (!isShow) {
        this.$store.dispatch("hideNotify")
      }
    },
  },
}
</script>

<template>
  <v-app>
    <v-navigation-drawer app clipped fixed width="260" v-model="drawer">
      <app-sidebar />
    </v-navigation-drawer>

    <v-toolbar app fixed clipped-left color="primary" class="elevation-0">
      <v-toolbar-side-icon class="white--text" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="white--text">Team-Based Robot</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon color="white--text">
        <v-icon>notifications</v-icon>
      </v-btn>
      <v-menu transition="slide-y-transition" bottom offset-y :nudge-bottom="14">
        <v-btn icon slot="activator" dark>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="onMenuClicked('profile')">
            <v-list-tile-content>
              <v-list-tile-title>Profile</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon color="primary">account_circle</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile @click="onMenuClicked('logout')">
            <v-list-tile-content>
              <v-list-tile-title>Log Out</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon color="primary">exit_to_app</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </v-content>

    <v-footer app fixed>
      <app-Footer></app-Footer>
    </v-footer>

    <v-snackbar
      id="app-notify"
      :timeout="5000"
      top
      right
      :value="notify.isShow"
      @input="onOpenNotifyChanged">
      <div class="notify-text">{{ notify.msg }}</div>
      <v-btn flat color="primary" @click.native="onOpenNotifyChanged(false)">Close</v-btn>
    </v-snackbar>

  </v-app>
</template>
