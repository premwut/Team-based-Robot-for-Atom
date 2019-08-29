<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    itemKey: {
      type: String,
      default: "id",
    },
    value: {
      type: Array,
      default: [],
    },
  },
  methods: {
    onItemClicked (item) {
      item.selected = !item.selected
      this.$emit("input", this.value)
      this.$emit("change", item)
    },
  },
}
</script>

<template>
  <div class="selection-list-wrapper">
    <v-subheader class="header-list">{{ title }}</v-subheader>
    <div class="selection-list">
      <div v-for="item in value" :key="`${item[itemKey]}`" :data-key="`${item[itemKey]}`"
        class="selection-item"
        @click="onItemClicked(item)">
        <div class="control-wrapper">
          <v-icon v-if="item.selected" color="primary">check_box_outline</v-icon>
          <v-icon v-else>check_box_outline_blank</v-icon>
        </div>
        <div :class="{ '-selected': item.selected }" class="title-wrapper">
          <slot :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.selection-list-wrapper {
  .header-list {
    border-bottom: 1px solid #dddddd;
  }
  .selection-list {
    display: flex;
    flex-flow: column wrap;
    margin: 10px 0;
    overflow-y: scroll;
    overflow-y: -moz-scrollbars-none;
    &::-webkit-scrollbar {
      display: none;
      width: 0px;
    }

    .selection-item {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      height: 44px;
      padding: 0 15px;
      &:hover {
        background-color: lighten($color: #dddddd, $amount: 10);
      }
      $widthControl: 10%;
      .control-wrapper {
        width: $widthControl;
      }
      .title-wrapper {
        width: 100% - $widthControl;
        user-select: none;
        &.-selected {
          font-weight: bold;
        }
      }
    }
  }
}
</style>

