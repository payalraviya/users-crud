<template>
    <div class="flex justify-center items-center h-screen">
      <form @submit.prevent="login" class="bg-white p-6 rounded shadow-lg w-80">
        <h2 class="text-2xl font-bold mb-4">Login</h2>
  
        <div class="mb-4">
          <label class="block mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="border border-gray-300 p-2 w-full rounded"
            required
          />
        </div>
  
  
        <div class="flex justify-center">
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        </div>
        <div class="mt-4 text-center">
        <p class="text-gray-600">
          Not have an account?
          <router-link to="/register" class="text-blue-500 underline"
            >Register</router-link
          >
        </p>
      </div>

  
        <div v-if="apiError" class="mt-4 text-red-500">
          {{ apiError }}
        </div>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { useStore } from "vuex";
  
  const store = useStore();
  
  const email = ref("");
  const name = ref("");
  const apiError = ref("");
  
  const login = async () => {
    try {
      await store.dispatch("login", { email: email.value, name: name.value });
    } catch (error) {
      apiError.value = "Register failed. Please check your credentials.";
    }
  };
  </script>
  