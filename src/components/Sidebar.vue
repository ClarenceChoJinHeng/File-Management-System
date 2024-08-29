<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { File } from 'lucide-vue-next'

// Assuming you have an API endpoint for these operations
const API_URL = 'http://localhost:5001/api'

const createFolder = async () => {
  try {
    const folderName = prompt('Enter folder name:')
    if (!folderName) return
    
    const response = await axios.post(`${API_URL}/create-folder`, { folderName })
    alert(`Folder created: ${response.data.folderPath}`)
  } catch (error) {
    console.error('Error creating folder:', error)
    alert('Failed to create folder')
  }
}

const uploadFile = async () => {
  try {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.click()

    fileInput.onchange = async (e) => {
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_URL}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert(`File uploaded: ${response.data.fileUrl}`)
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Failed to upload file')
  }
}

const uploadFolder = async () => {
  try {
    const folderName = prompt('Enter the name for the new folder:')
    if (!folderName) {
      alert('Folder name is required')
      return
    }

    const folderInput = document.createElement('input')
    folderInput.type = 'file'
    folderInput.webkitdirectory = true
    folderInput.click()

    folderInput.onchange = async (e) => {
      const files = e.target.files
      const formData = new FormData()
      formData.append('folderName', folderName)
      
      for (let i = 0; i < files.length; i++) {
        // Use the combination of new folder name and relative path
        const filePath = `${folderName}/${files[i].webkitRelativePath}`
        formData.append('files', files[i], filePath)
      }

      const response = await axios.post(`${API_URL}/upload-folder`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert(`Folder uploaded: ${response.data.folderUrl}`)
    }
  } catch (error) {
    console.error('Error uploading folder:', error)
    alert('Failed to upload folder')
  }
}
</script>

<template>
  <div class="sidebar">
      <div class="sidebar__file-icon">
        <File size="30" />
        <p class="sidebar__file-label">File-Management-System</p>
      </div>

      <div class="sidebar__plus-icon">
        <div class="sidebar__buttons">
          <button @click="createFolder">Create Folder</button>
          <button @click="uploadFile">Upload File</button>
          <button @click="uploadFolder">Upload Folder</button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    width: max-content;
    height: 100vh;
    padding: 1rem;
    gap: 1rem;
    background-color: var(--dark--white);
    border-right: 1px solid black;
  }

  .sidebar__file-icon {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: max-content;
  }

  .sidebar__plus-icon {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar__file-label {
    font-size: 1rem;
    font-weight: 600;
  }

  .sidebar__buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sidebar__buttons button {
    padding: 0.75rem;
  }

  .sidebar__button:hover {
    background: black;
    cursor: pointer;
  }
</style>