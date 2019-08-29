<script>
export default {
  props: {
    label: {
      type: String,
      default: "Please Wait...",
    },
  },
}
</script>

<template>
  <div class="wrapper">
    <div class="spinner"/>
    <div class="label">{{ label }}</div>
  </div>
</template>

<style lang="scss" scoped>

.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 500px;
  justify-content: center;
  align-items: center;
  .label {
    margin: 15px auto;
    font-size: 2rem;
    color: #00bfa5;
  }
}

.spinner {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 4px solid #eee;
  transform: translate(0, 0);
  &:after,
  &:before {
    content: "";
    display: block;
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }
  &:after {
    position: absolute;
    top: -2px;
    left: -2px;
    border: 4px solid transparent;
    border-top-color: #00bfa5;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
