<template>
  <div
    :style="{ marginLeft: `${indent * 20}px` }"
    class="flex items-center justify-between"
    :draggable="content.type === 'file'"
    @dragstart="onDragStart"
    @dragover.prevent
    @drop="onDrop"
  >
    <div @click="toggleVisibility" class="flex items-center cursor-pointer">
      <span v-if="content.type === 'file'"> 📄 {{ name }} </span>
      <span v-else> 📁 {{ name }} </span>
    </div>
    <input
      type="checkbox"
      v-model="isSelected"
      @change="$emit('selection-change', name, isSelected)"
      class="cursor-pointer"
    />
  </div>
  <div
    v-if="content.type === 'folder' && content.visible"
    class="mb-4 mt-4 flex gap-2 flex-col"
  >
    <FileOrFolder
      v-for="(subContent, subName) in content.children"
      :key="subName"
      :name="subName"
      :content="subContent"
      :indent="indent + 1"
      @folder-deleted="handleFolderDeleted"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  name: String,
  content: Object,
  indent: Number,
});

const emit = defineEmits(["folder-deleted", "selection-change", "move-file"]);

const isSelected = ref(false);

const toggleVisibility = () => {
  if (props.content.type === "folder") {
    props.content.visible = !props.content.visible;
  }
};

const onDragStart = (event) => {
  event.dataTransfer.setData("text/plain", props.name);
};

const onDrop = (event) => {
  if (props.content.type === "folder") {
    const fileName = event.dataTransfer.getData("text");
    emit("move-file", fileName, props.name);
  }
};

const handleFolderDeleted = (folderName) => {
  if (props.content.type === "folder" && props.content.children) {
    delete props.content.children[folderName];
  }
  emit("folder-deleted", folderName);
};

const handleSelectionChange = (name, isSelected) => {
  emit("selection-change", name, isSelected);
};
</script>
