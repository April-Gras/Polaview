<script lang="ts" setup>
defineEmits<{
  (e: "done", value: void): void;
}>();
</script>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "TransitionExpand",
  methods: {
    enter(element: HTMLElement) {
      const width = getComputedStyle(element).width;

      element.style.width = width;
      element.style.position = "absolute";
      element.style.visibility = "hidden";
      element.style.height = "auto";

      const height = getComputedStyle(element).height;

      element.style.width = "";
      element.style.position = "";
      element.style.visibility = "";
      element.style.height = "0";

      // Force repaint to make sure the
      // animation is triggered correctly.
      getComputedStyle(element).height;

      // Trigger the animation.
      // We use `requestAnimationFrame` because we need
      // to make sure the browser has finished
      // painting after setting the `height`
      // to `0` in the line above.
      requestAnimationFrame(() => {
        element.style.height = height;
        this.$emit("done");
      });
    },
    afterEnter(element: HTMLElement) {
      element.style.height = "auto";
    },
    leave(element: HTMLElement) {
      const height = getComputedStyle(element).height;

      element.style.height = height;

      // Force repaint to make sure the
      // animation is triggered correctly.
      getComputedStyle(element).height;

      requestAnimationFrame(() => {
        element.style.height = "0";
      });
    },
  },
});
</script>

<template>
  <transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot />
  </transition>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  @apply overflow-hidden transition-all duration-300 ease-in-out;
}

.expand-enter,
.expand-leave-to {
  @apply h-0;
}
</style>
