<template>
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">User List</h1>
  
      <!-- Create User Button -->
      <button 
        @click="openModal()" 
        class="bg-blue-500 text-white px-4 py-2 rounded mb-6">
        Create New User
      </button>
  
      <!-- User Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr class="bg-gray-100 border-b">
              <th class="text-left py-2 px-4 border-r">ID</th>
              <th class="text-left py-2 px-4 border-r">Name</th>
              <th class="text-left py-2 px-4 border-r">Email</th>
              <th class="text-left py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b">
              <td class="py-2 px-4 border-r">{{ user.id }}</td>
              <td class="py-2 px-4 border-r">{{ user.name }}</td>
              <td class="py-2 px-4 border-r">{{ user.email }}</td>
              <td class="py-2 px-4">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
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
  