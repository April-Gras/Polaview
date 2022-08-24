<script lang="ts">
import { defineComponent } from "vue";

import "@videojs/themes/dist/sea/index.css";
import videojs, { VideoJsPlayer } from "video.js";

export default defineComponent({
  props: {
    source: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      player: null as null | VideoJsPlayer,
    };
  },
  mounted() {
    if (!this.$refs.videoPlayer || this.player) return;
    this.player = videojs(
      this.$refs.videoPlayer as Element,
      {
        fluid: true,
        'sources': [{
          'src': this.source,
          'type': 'video/mp4'
        }],
      },
      () => {
        if (!this.player) return;
      }
    );
  },
  beforeDestroy() {
    if (!this.player) return;
    // TODO beforeDestroy save current video timestamp
    // console.log((this.$refs.videoPlayer as HTMLVideoElement).currentTime)
    this.player.dispose();
  },
});
</script>

<template>
  <video ref="videoPlayer" class="video-js vjs-theme-sea" controls preload="auto">
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a
      web browser that
      <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
  </video>
</template>