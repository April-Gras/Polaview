<script setup lang="ts">
defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:validationArray", value: string[]): void;
  (e: "focus", value: void): void;
  (e: "blur", value: void): void;
}>();
</script>

<script lang="ts">
import { defineComponent, defineEmits, PropType } from "vue";

import HeightExpandVue from "@/components/transitions/HeightExpand.vue";

export default defineComponent({
  components: {
    HeightExpandVue,
  },
  props: {
    labelForUid: {
      type: String,
      required: true,
    },
    labelIsScreenReaderOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    inputType: {
      type: String as PropType<"text" | "password">,
      default: "text",
    },
    modelValue: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "",
    },
    validationKey: {
      type: String,
      required: false,
    },
    validationArray: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  methods: {
    handleInput(event: Event): void {
      if (!event.target) return;
      // @ts-expect-error
      this.$emit("update:modelValue", event.target.value);
      if (!this.displayError) return;
      const newValidationStandings = this.validationKey
        ? this.validationArray.filter((e) => e !== this.validationKey)
        : this.validationArray;
      this.$emit("update:validationArray", newValidationStandings);
    },
  },
  computed: {
    displayError(): boolean {
      if (!this.validationKey) return false;
      return (
        this.validationArray.includes(this.validationKey) &&
        !!this.$slots["error-message"]
      );
    },
  },
});
</script>

<template>
  <div class="relative grid w-full gap-1">
    <label
      :for="labelForUid"
      class="label-text"
      :class="{ 'sr-only': labelIsScreenReaderOnly }"
    >
      <slot name="label" />
    </label>
    <input
      class="rounded-sm bg-neutral-200 py-3 px-4 placeholder:text-neutral-500 dark:bg-gray-700 dark:placeholder:text-neutral-500"
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
    <HeightExpandVue>
      <span
        class="text-sm font-bold text-red-500 dark:text-rose-500"
        v-if="displayError"
      >
        <slot name="error-message" />
      </span>
    </HeightExpandVue>
  </div>
</template>
