<script lang="ts">
import { defineComponent, PropType } from "vue";

import { SubtitleTrack } from ".prisma/client";

export default defineComponent({
  props: {
    fileId: {
      type: Number,
      required: true,
    },
    subtitles: {
      type: Array as PropType<SubtitleTrack[]>,
      required: true,
    },
  },
});
</script>

<template>
  <video ref="videoPlayer" controls preload="auto">
    <source type="video/mp4" :src="`/data-layer/video/${fileId}`" />
    <track
      v-for="subtitle in subtitles"
      kind="captions"
      :src="`/data-layer/video/${fileId}/subtitle/${subtitle.id}`"
      :language="$t('lang.eng').toString()"
    />
  </video>
</template>
