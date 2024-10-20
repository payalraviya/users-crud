<template>
    <div>
      <h1>Users</h1>
      <ul>
        <li v-for="user in users" :key="user.id">{{ user.name }} - {{ user.email }}</li>
      </ul>
    </div>
  </template>
  
  <script setup>
  const { data: users } = await useFetch('/api/users')
  </script>
  