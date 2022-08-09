<script lang="ts">
import { defineComponent } from "vue";

import videojs from "video.js";

export default defineComponent({
  props: {
    source: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      player: null as null | ReturnType<typeof videojs>,
    };
  },
  mounted() {
    if (!this.$refs.videoPlayer || this.player) return;
    this.player = videojs(
      this.$refs.videoPlayer as Element,
      {
        fluid: true,
      },
      () => {
        if (!this.player) return;
      }
    );
  },
  beforeDestroy() {
    if (!this.player) return;
    this.player.dispose();
  },
});
</script>

<template>
  <video
    ref="videoPlayer"
    class="video-js vjs-theme-city"
    controls
    preload="auto"
    data-setup="{fluid: true}"
  >
    <source :src="source" type="video/mp4" />
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a
      web browser that
      <a href="https://videojs.com/html5-video-support/" target="_blank"
        >supports HTML5 video</a
      >
    </p>
  </video>
</template>

<style lang="scss">
.video-js .vjs-big-play-button {
  @apply flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-dashed border-white;
  top: calc(50% - theme("space.12"));
  left: calc(50% - theme("space.12"));
}

.vjs-controls-disabled .vjs-big-play-button,
.vjs-error .vjs-big-play-button,
.vjs-has-started .vjs-big-play-button,
.vjs-using-native-controls .vjs-big-play-button {
  @apply hidden;
}

.video-js .vjs-big-play-button .vjs-icon-placeholder::before {
  @apply h-auto w-auto;
}

.vjs-icon-placeholder {
  @apply relative flex h-[45px] w-[30px] items-center justify-center;
}
</style>
