<script>
import { mapGetters } from "vuex"

export default {
  props: ["isOpen", "team"],
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
    team (value) {
      if (value) {
        this.isEditing = value !== undefined
        this.editingId = value.team_id
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
      this.$emit("update:team", undefined)
    },
    onCancelButtonClicked () {
      this.clearAction()
    },
    async onSaveButtonClicked () {
      try {
        if (this.$refs.form.validate()) {
          this.isLoading = true
          const action = this.isEditing ? "team/editTeam" : "team/createTeam"
          const { proj_id = null } = this.formData.project || {}
          const data = { ...this.formData, team_id: this.editingId, proj_id }
          delete data.project
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
        <v-card-title class="headline">{{ isEditing ? 'Edit' : 'Create' }} Team</v-card-title>

        <v-card-text class="py-0">
          <v-form id="team-form" v-model="formValid" ref="form" lazy-validation>
            <v-container grid-list-xs>
              <v-layout row>
                  <v-flex xs12 class="mx-2">
                    <v-text-field label="Team Name"
                      id="team-name" type="text" v-model="formData.team_name"
                      :rules="[v => !!v || 'Team name is required']" required>
                    </v-text-field>
                  </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 class="mx-2">
                  <v-autocomplete id="team-project" label="Work on project"
                    v-model="formData.project"
                    :items="projects"
                    item-text="proj_name"
                    item-value="proj_id"
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
