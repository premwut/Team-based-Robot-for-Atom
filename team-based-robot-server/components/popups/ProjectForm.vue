<script>
import { mapGetters } from "vuex"

export default {
  props: ["isOpen", "project"],
  data: () => ({
    show: false,
    formValid: false,
    isEditing: false,
    isLoading: false,
    editingId: undefined,
    formData: {},
  }),
  watch: {
    isOpen (val) {
      this.show = val
    },
    project (value) {
      if (value) {
        this.isEditing = value !== undefined
        this.editingId = value.proj_id
        this.formData = value
      }
    },
  },
  computed: {
    ...mapGetters({
      projects: "project/getAllProject",
    }),
  },
  methods: {
    clearAction () {
      this.isEditing = false
      this.editingId = undefined
      this.$refs.form.reset()
      this.$emit("update:isOpen", false)
      this.$emit("update:project", undefined)
    },
    onCancelButtonClicked () {
      this.clearAction()
    },
    async onSaveButtonClicked () {
      try {
        if (this.$refs.form.validate()) {
          this.isLoading = true
          const action = this.isEditing ? "project/editProject" : "project/createProject"
          const data = { ...this.formData, proj_id: this.editingId }
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
        <v-card-title class="headline">{{ isEditing ? 'Edit' : 'Create' }} Project</v-card-title>

        <v-card-text class="py-0">
          <v-form id="project-form" v-model="formValid" ref="form" lazy-validation>
            <v-container grid-list-xs>
              <v-layout row>
                  <v-flex xs12 class="mx-2">
                    <v-text-field label="Project Name"
                      id="project-name" type="text" v-model="formData.proj_name"
                      :rules="[v => !!v || 'Project name is required']" required>
                    </v-text-field>
                  </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 class="mx-2">
                  <v-text-field label="Project Description"
                    id="project-desc" type="text" v-model="formData.proj_desc"
                    :rules="[v => !!v || 'Project description is required']" required>
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
