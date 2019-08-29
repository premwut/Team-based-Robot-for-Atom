<script>
import PageLoading from "~/components/PageLoading.vue"

export default {
  components: {
    PageLoading,
  },
  async beforeMount () {
    const { token, type } = this.$route.query
    if (token && type) {
      const isValid = await this.verifyToken(token)
      isValid && this.redirectToTarget(type)
    }
  },
  methods: {
    async verifyToken (token) {
      try {
        await this.$store.dispatch("verifyToken", token)
        return true
      } catch (error) {
        return false
      }
    },
    redirectToTarget (type) {
      switch (type) {
        case "manage-team-member":
          this.$router.push("/admin/team/member")
          break
        case "assign-team-to-project":
          this.$router.push("/admin/team/info")
          break
        default:
          console.log("Unknown type")
          break
      }
    },
  },
}
</script>

<template>
    <div>
        <page-loading label="Authenticating..." />
    </div>
</template>
