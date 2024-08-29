<template>
  <div>
    <div :style="{ marginLeft: `${indent * 20}px` }" @click="toggleVisibility">
      <span v-if="content.type === 'file'">📄 {{ name }}</span>
      <span v-else>📁 {{ name }}</span>
    </div>
    <div class="mb-4 mt-4 flex gap-2 flex-col" v-if="content.type === 'folder' && content.visible">
      <div v-for="(subContent, subName) in content.children" :key="subName">
        <FileOrFolder :name="subName" :content="subContent" :indent="indent + 1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, reactive } from 'vue'

const props = defineProps({
  name: String,
  content: Object,
  indent: Number
})

const toggleVisibility = () => {
  if (props.content.type === 'folder') {
    props.content.visible = !props.content.visible
  }
}

// Ensure folders have a visible property
if (props.content.type === 'folder' && props.content.visible === undefined) {
  props.content.visible = false
}
</script>