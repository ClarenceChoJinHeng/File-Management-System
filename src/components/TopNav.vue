<script setup>
import { Search } from "lucide-vue-next";
</script>

<template>
  <div class="topnav flex items-center gap-2">
    <Search />
    <input
      type="search"
      placeholder="Search Files or Folder"
      class="search"
    />
  </div>
</template>

<style scoped>
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
</style>