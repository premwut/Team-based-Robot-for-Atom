<template>
  <v-layout row justify-center>
    <v-dialog v-model="show" max-width="500">
      <v-card>
        <v-card-title class="headline">Server Error!</v-card-title>
        <v-card-text>{{ textContent }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="onCloseButtonClicked">Close</v-btn>
          <v-btn color="primary" flat @click="onReloadButtonClicked">Reload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ["isOpen", "content", "onReload"],
  data: () => ({
    show: false,
  }),
  watch: {
    isOpen (val) {
      this.show = val
    },
  },
  computed: {
    textContent () {
      return this.content || "Load data failure. Plase try again."
    },
  },
  methods: {
    onCloseButtonClicked () {
      this.$emit("update:isOpen", false)
    },
    onReloadButtonClicked () {
      this.onReload && this.onReload()
      this.show = false
    },
  },
}
</script>

