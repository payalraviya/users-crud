<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">User List</h1>

    <div>
      <button
        @click="openModal"
        class="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Create New User
      </button>
    </div>

    <div v-if="isLoading" class="text-center mb-4">
      <span class="text-gray-500">Loading users...</span>
      <svg class="animate-spin h-5 w-5 inline-block" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0115.51 4.09A6.012 6.012 0 0018 12h-6v6a8 8 0 01-8-8z"
        ></path>
      </svg>
    </div>

    <div class="overflow-x-auto" v-else>
      <table class="min-w-full bg-white border border-gray-300">
        <thead>
          <tr class="bg-gray-100 border-b">
            <th class="text-left py-2 px-4 border-r">Sr. No</th>
            <th class="text-left py-2 px-4 border-r">Name</th>
            <th class="text-left py-2 px-4 border-r">Email</th>
            <th class="text-left py-2 px-4 border-r">Created</th>
            <th class="text-left py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="users.length === 0">
            <tr>
              <td colspan="5" class="text-center py-4">No records found</td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="(user, index) in users" :key="user.id" class="border-b">
              <td class="py-2 px-4 border-r">{{ index + 1 }}</td>
              <td class="py-2 px-4 border-r">{{ user.name }}</td>
              <td class="py-2 px-4 border-r">{{ user.email }}</td>
              <td class="py-2 px-4 border-r">
                {{ formatCreatedAt(user.createdAt) }}
              </td>
              <td class="py-2 px-4">
                <button
                  @click="editUser(user)"
                  class="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  @click="deleteUser(user.id)"
                  class="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editMode ? 'Edit User' : 'Create New User' }}
        </h2>

        <form @submit.prevent="editMode ? updateUser() : createUser()">
          <div class="mb-4">
            <label class="block mb-2">Name</label>
            <input
              v-model="user.name"
              class="border border-gray-300 p-2 w-full rounded"
              placeholder="Name"
              required
            />
            <span v-if="validationErrors.name" class="text-red-500 text-sm">
              {{ validationErrors.name }}
            </span>
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
            <span v-if="validationErrors.email" class="text-red-500 text-sm">
              {{ validationErrors.email }}
            </span>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
              {{ editMode ? 'Update' : 'Create' }}
            </button>
          </div>

          <div v-if="apiError" class="mt-4 text-red-500">
            {{ apiError }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const users = computed(() => store.getters.getUsers);
const user = computed(() => store.getters.getUser);
const isLoading = computed(() => store.getters.isLoading);
const isModalOpen = computed(() => store.getters.isModalOpen);
const editMode = computed(() => store.getters.isEditMode);
const validationErrors = computed(() => store.getters.getValidationErrors);
const apiError = computed(() => store.getters.getApiError);
const formatCreatedAt = store.getters.formatCreatedAt;

const fetchUsers = () => store.dispatch('fetchUsers');
const createUser = () => {
  store.dispatch('createUser', user.value);
};

const updateUser = () => {
  store.dispatch('updateUser', user.value);
};
const deleteUser = (id: number) => store.dispatch('deleteUser', id);
const openModal = () => store.dispatch('openModal');
const closeModal = () => store.dispatch('closeModal');
const editUser = (user:any) => store.dispatch('editUser', user);

onMounted(() => {
  fetchUsers();
});
</script>
