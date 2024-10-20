<template>
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">User List</h1>
      
      <button 
        @click="openModal()" 
        class="bg-blue-500 text-white px-4 py-2 rounded mb-6">
        Create New User
      </button>
  
      <ul v-if="users" class="space-y-4">
        <li v-for="user in users" :key="user.id" class="flex justify-between items-center">
          <span><strong>{{ user.name }}</strong> - {{ user.email }}</span>
          <div>
            <button 
              @click="editUser(user)" 
              class="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
              Edit
            </button>
            <button 
              @click="deleteUser(user.id)" 
              class="bg-red-500 text-white px-4 py-2 rounded">
              Delete
            </button>
          </div>
        </li>
      </ul>
  
      <!-- Modal for Create/Edit User -->
      <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">{{ editMode ? 'Edit User' : 'Create New User' }}</h2>
          
          <form @submit.prevent="editMode ? updateUser() : createUser()">
            <div class="mb-4">
              <label class="block mb-2">Name</label>
              <input 
                v-model="user.name" 
                class="border border-gray-300 p-2 w-full rounded" 
                placeholder="Name" 
                required
              />
            </div>
  
            <div class="mb-4">
              <label class="block mb-2">Email</label>
              <input 
                v-model="user.email" 
                class="border border-gray-300 p-2 w-full rounded" 
                placeholder="Email" 
                type="email" 
                required
              />
            </div>
  
            <div class="flex justify-end">
              <button 
                type="button" 
                @click="closeModal()" 
                class="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-blue-500 text-white px-4 py-2 rounded">
                {{ editMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useFetch } from '#app'
  
  const users = ref([])
  const user = ref({ name: '', email: '' })
  const editMode = ref(false)
  const isModalOpen = ref(false)
  const userId = ref(null)
  
  const fetchUsers = async () => {
    const { data } = await useFetch('/api/users')
    users.value = data.value
  }
  
  const openModal = () => {
    user.value = { name: '', email: '' }  // Clear form
    editMode.value = false
    isModalOpen.value = true
  }
  
  const closeModal = () => {
    isModalOpen.value = false
  }
  
  const createUser = async () => {
    await $fetch('/api/users', {
      method: 'POST',
      body: { name: user.value.name, email: user.value.email },
    })
    closeModal()
    await fetchUsers()
  }
  
  const editUser = (selectedUser) => {
    user.value = { name: selectedUser.name, email: selectedUser.email }
    userId.value = selectedUser.id
    editMode.value = true
    isModalOpen.value = true
  }
  
  const updateUser = async () => {
    await $fetch(`/api/users/${userId.value}`, {
      method: 'PUT',
      body: { name: user.value.name, email: user.value.email },
    })
    closeModal()
    await fetchUsers()
  }
  
  const deleteUser = async (id) => {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    await fetchUsers()
  }
  
  onMounted(async () => {
    await fetchUsers()
  })
  </script>
  