<template>
    <div>
      <h1>User List</h1>
      <ul v-if="users">
        <li v-for="user in users" :key="user.id">
          <strong>{{ user.name }}</strong> - {{ user.email }}
          <button @click="deleteUser(user.id)">Delete</button>
          <button @click="editUser(user)">Edit</button>
        </li>
      </ul>
  
      <h2 v-if="editMode">Edit User</h2>
      <h2 v-else>Create New User</h2>
  
      <form @submit.prevent="editMode ? updateUser() : createUser()">
        <input v-model="user.name" placeholder="Name" required />
        <input v-model="user.email" placeholder="Email" required />
        <button type="submit">{{ editMode ? 'Update' : 'Create' }}</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useFetch } from '#app'
  
  const users = ref([])
  const user = ref({ name: '', email: '' })
  const editMode = ref(false)
  const userId = ref(null)
  
  const fetchUsers = async () => {
    const { data } = await useFetch('/api/users')
    users.value = data.value
  }
  
  const createUser = async () => {
    await $fetch('/api/users', {
      method: 'POST',
      body: { name: user.value.name, email: user.value.email },
    })
    user.value = { name: '', email: '' }
    await fetchUsers()
  }
  
  const editUser = (selectedUser) => {
    user.value = { name: selectedUser.name, email: selectedUser.email }
    userId.value = selectedUser.id
    editMode.value = true
  }
  
  const updateUser = async () => {
    await $fetch(`/api/users/${userId.value}`, {
      method: 'PUT',
      body: { name: user.value.name, email: user.value.email },
    })
    user.value = { name: '', email: '' }
    editMode.value = false
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
  