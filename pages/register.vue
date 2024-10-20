<template>
  <div class="flex justify-center items-center h-screen">
    <form
      @submit.prevent="register"
      class="bg-white p-6 rounded shadow-lg w-80"
    >
      <h2 class="text-2xl font-bold mb-4">Register</h2>

      <div class="mb-4">
        <label class="block mb-2">Name</label>
        <input
          v-model="name"
          type="text"
          placeholder="Name"
          class="border border-gray-300 p-2 w-full rounded"
          required
        />
        <span v-if="validationErrors.name" class="text-red-500 text-sm">
          {{ validationErrors.name }}
        </span>
      </div>
      <div class="mb-4">
        <label class="block mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="border border-gray-300 p-2 w-full rounded"
          required
        />
        <span v-if="validationErrors.email" class="text-red-500 text-sm">
          {{ validationErrors.email }}
        </span>
      </div>

      <div class="flex justify-center">
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
          Register
        </button>
      </div>
      <div class="mt-4 text-center">
        <p class="text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-blue-500 underline"
            >Login</router-link
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
import { useRouter } from "vue-router"; 

const store = useStore();
const email = ref("");
const name = ref("");
const apiError = ref("");
const validationErrors = computed(() => store.getters.getValidationErrors);

const register = async () => {
  try {
    await store.dispatch("register", { email: email.value, name: name.value });
  } catch (error) {
    apiError.value = "Register failed. Please check your credentials.";
  }
};
</script>
  