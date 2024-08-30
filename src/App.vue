<script setup>
import { ref, onMounted } from "vue";
import { Trash, Edit } from "lucide-vue-next";
import axios from "axios";
import Sidebar from "./components/Sidebar.vue";
import TopNav from "./components/TopNav.vue";
import FileOrFolder from "./components/FileOrFolder.vue";

const fileSystem = ref({});
const isLoading = ref(true);
const error = ref(null);
const selectedItems = ref({});

const fetchFilesAndFolders = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(
      "http://localhost:5001/api/files-and-folders"
    );
    fileSystem.value = response.data;
    isLoading.value = false;
  } catch (err) {
    console.error("Error fetching files and folders:", err);
    error.value = "Failed to fetch files and folders";
    isLoading.value = false;
  }
};

const handleSelectionChange = (path, isSelected) => {
  if (isSelected) {
    selectedItems.value[path] = true;
  } else {
    delete selectedItems.value[path];
  }
};

const deleteSelectedItems = async () => {
  for (const path in selectedItems.value) {
    try {
      await axios.delete("http://localhost:5001/api/delete-item", {
        data: { path },
      });
      // Remove the item from the fileSystem
      removeItemFromFileSystem(path);
    } catch (error) {
      console.error(`Error deleting ${path}:`, error);
    }
  }
  selectedItems.value = {};
};

const removeItemFromFileSystem = (path) => {
  const pathParts = path.split("/");
  let current = fileSystem.value;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!current[pathParts[i]] || !current[pathParts[i]].children) {
      console.error(`Path ${path} not found in fileSystem`);
      return;
    }
    current = current[pathParts[i]].children;
  }
  delete current[pathParts[pathParts.length - 1]];
};

onMounted(fetchFilesAndFolders);
</script>

<template>
  <div class="flex items-start">
    <Sidebar />
    <div class="content flex flex-col w-full">
      <TopNav />
      <div class="px-4 py-4 h-39 overflow-y-auto">
        <div class="flex items-center justify-between cursor-pointer mb-4">
          <h2 class="text-2xl font-bold">Files and Folders</h2>
          <div class="flex items-center justify-between gap-2">
            <Trash
              size="20"
              @click="deleteSelectedItems"
              class="cursor-pointer hover:bg-gray-200 rounded-md"
            />
            <Edit size="20" class="hover:bg-gray-200 rounded-md" />
          </div>
        </div>
        <div v-if="isLoading">Loading...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else class="flex flex-col gap-2 text-xs">
          <div v-for="(content, name) in fileSystem" :key="name">
            <FileOrFolder
              :name="name"
              :content="content"
              :indent="0"
              @selection-change="handleSelectionChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
button,
input {
  font-family: "Plus Jakarta Sans", sans-serif;
}

.hidden {
  display: none;
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-start {
  align-items: start;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.overflow-y-auto {
  overflow-y: auto;
}

.h-39 {
  height: 39rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 0.5rem;
}

.text-xs {
  font-size: 0.938rem;
  font-weight: 500;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-bg-gray-200:hover {
  background: lightgrey;
}

.rounded-md {
  border-radius: 0.375rem;
}
</style>
