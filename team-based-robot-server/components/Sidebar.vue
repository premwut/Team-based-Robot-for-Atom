<script>
import { mapGetters } from "vuex"

export default {
  computed: mapGetters({
    menuList: "menu/get",
    features: "getFeatures",
  }),
  methods: {
    routeTo (link) {
      this.$router.push(link)
    },
    verifyPermission (menu) {
      let isAllow = false
      this.features.map(item => {
        const isMatchFeature = item.feature === menu.feature
        const isMatchPermission = item.permission === menu.permission
        const isMatch = isMatchFeature && isMatchPermission
        const isAllowAll = menu.allowAll && item.feature === "ALL"
        if (isMatch || isAllowAll) {
          isAllow = true
        }
      })
      return isAllow
    },
  },
}
</script>

<template>
  <v-list dense>
    <template v-for="item in menuList" v-if="verifyPermission(item)">

      <v-list-group
        v-if="item.children.length > 0"
        :key="`group_${item.id}`"
        :prepend-icon="item.icon"
        no-action>
        <v-list-tile slot="activator">
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-for="subItem in item.children" :to="subItem.link" :key="subItem.title">
          <v-list-tile-content>
            <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon>{{ subItem.icon }}</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </v-list-group>

      <v-list-tile v-else :key="`single_${item.id}`" :to="item.link" nuxt exact>
        <v-list-tile-action>
          <v-icon v-html="item.icon" />
        </v-list-tile-action>
        <v-list-tile-title v-text="item.title" />
      </v-list-tile>

    </template>
  </v-list>
</template>
