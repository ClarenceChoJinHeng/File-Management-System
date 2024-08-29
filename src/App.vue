<script setup>
import { ref, onMounted, h } from "vue";
import axios from "axios";
import Sidebar from "./components/Sidebar.vue";
import TopNav from "./components/TopNav.vue";
import FileOrFolder from "./components/FileOrFolder.vue";

const fileSystem = ref({});
const isLoading = ref(true);
const error = ref(null);

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


onMounted(fetchFilesAndFolders);
</script>

<template>
  <div class="flex items-start">
    <Sidebar />

    <div class="content flex flex-col w-full">
      <TopNav />

      <div class="px-4 py-4">
        <h2 class="text-2xl font-bold mb-4">Files and Folders</h2>
        <div v-if="isLoading">Loading...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else class="flex flex-col gap-2 text-xs">
          <div v-for="(content, name) in fileSystem" :key="name">
            <FileOrFolder class="cursor-pointer" :name="name" :content="content" :indent="0" />
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

.gap-2 {
  gap: 0.5rem;
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
</style>
