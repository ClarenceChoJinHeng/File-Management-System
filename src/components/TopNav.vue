<script setup>
import { ref, watch } from "vue";
import { Search } from "lucide-vue-next";

const searchQuery = ref("");
const searchResults = ref([]);

const searchFiles = async () => {
  if (searchQuery.value.trim() === "") {
    searchResults.value = [];
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5001/api/search?query=${encodeURIComponent(
        searchQuery.value
      )}`
    );
    if (!response.ok) {
      throw new Error("Search failed");
    }
    searchResults.value = await response.json();
  } catch (error) {
    console.error("Error searching files:", error);
    // Handle error (e.g., show error message to user)
  }
};

watch(searchQuery, () => {
  searchFiles();
});
</script>

<template>
  <div class="topnav flex flex-col items-start gap-2">
    <div class="flex items-center gap-2 w-full">
      <Search />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search Files or Folder"
        class="search"
      />
    </div>
    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="result in searchResults"
        :key="result.path"
        class="search-result-item"
      >
        <span>{{ result.name }}</span>
        <span class="result-type">{{ result.type }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.topnav {
  padding: 1rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
}
.search {
  width: 100%;
  border: none;
  outline: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
}
.search-results {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}
.search-result-item {
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.search-result-item:last-child {
  border-bottom: none;
}
.result-type {
  font-size: 0.8rem;
  color: #666;
}
</style>
