<script>

export default {
  props: ["isOpen", "keyword"],
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
    keyword (value) {
      if (value) {
        this.isEditing = value !== undefined
        this.editingId = value.proj_id
        this.formData = value
      }
    },
  },
  methods: {
    clearAction () {
      this.isEditing = false
      this.editingId = undefined
      this.$emit("update:isOpen", false)
    },
    onCloseButtonClicked () {
      this.clearAction()
    },
  },
}
</script>

<template>
  <v-layout row justify-center>
    <v-dialog v-model="show" max-width="700" persistent>
      <v-card>
        <v-card-title class="headline">Keyword Detail</v-card-title>

        <v-card-text class="py-0">
          <v-container class="pa-0" grid-list-xs>
            <v-layout row>
                <v-flex xs12 class="mx-2">
                  <v-text-field label="Keyword Name"
                    id="keyword-name" type="text" v-model="formData.kwd_name" readonly>
                  </v-text-field>
                </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12 class="mx-2">
                <v-textarea label="Keyword Content"
                  id="keyword-content" type="text" v-model="formData.kwd_content" readonly>
                </v-textarea>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12 class="mx-2">
                <v-text-field label="Keyword Description"
                  id="keyword-desc" type="text" v-model="formData.kwd_desc" readonly>
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <v-layout row>
              <v-flex xs12 class="mx-2">
                <v-textarea label="Keyword Document"
                  id="keyword-doc" type="text" v-model="formData.kwd_doc" readonly>
                </v-textarea>
              </v-flex>
            </v-layout>
          <v-layout row>
              <v-flex xs12 class="mx-2">
                <v-textarea label="Keyword Review"
                  id="keyword-review" type="text" v-model="formData.kwd_review.rw_comment" readonly>
                </v-textarea>
              </v-flex>
            </v-layout>
        </v-card-text>

        <v-card-actions class="px-3 py-3">
          <v-spacer></v-spacer>
          <v-btn id="btn-cancel-form" flat
            @click.prevent="onCloseButtonClicked">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
