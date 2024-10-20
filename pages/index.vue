<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">User List</h1>

    <div class="">
      <button
        @click="openModal()"
        class="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Create New User
      </button>
    </div>

    <div v-if="state.isLoading" class="text-center mb-4">
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

    <!-- User Table -->
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
          <template v-if="state.users.length === 0">
            <tr>
              <td colspan="5" class="text-center py-4">No records found</td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="(user, index) in state.users"
              :key="user.id"
              class="border-b"
            >
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
      v-if="state.isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ state.editMode ? "Edit User" : "Create New User" }}
        </h2>

        <form @submit.prevent="state.editMode ? updateUser() : createUser()">
          <div class="mb-4">
            <label class="block mb-2">Name</label>
            <input
              v-model="state.user.name"
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
              v-model="state.user.email"
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
              @click="closeModal()"
              class="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {{ state.editMode ? "Update" : "Create" }}
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
import { ref, reactive, onMounted } from "vue";
import { formatDistanceToNow } from "date-fns";
import { toast as ToastType } from "vue3-toastify";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface State {
  users: User[];
  user: User;
  editMode: boolean;
  isModalOpen: boolean;
  userId: number | null;
  isLoading: boolean;
}

const state = reactive<State>({
  users: [],
  user: {
    id: 0,
    name: "",
    email: "",
    createdAt: "",
  },
  editMode: false,
  isModalOpen: false,
  userId: null,
  isLoading: true,
});

const validationErrors = reactive({
  name: "",
  email: "",
});

const getToast = (): typeof ToastType =>
  useNuxtApp().$toast as typeof ToastType;

const toast = getToast();

const apiError = ref<string>("");

const fetchUsers = async () => {
  state.isLoading = true;
  try {
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("Network response was not ok");
    state.users = await response.json();
  } catch (error: any) {
    toast.error("Fail to fetch users", error);
  } finally {
    state.isLoading = false;
  }
};

const validateUser = (): boolean => {
  let isValid = true;
  validationErrors.name = "";
  validationErrors.email = "";

  // Validate name length
  if (state.user.name.length < 3 || state.user.name.length > 100) {
    validationErrors.name = "Name must be between 3 and 50 characters.";
    isValid = false;
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(state.user.email)) {
    validationErrors.email = "Please enter a valid email address.";
    isValid = false;
  }

  return isValid;
};

const openModal = () => {
  state.user = { id: 0, name: "", email: "", createdAt: "" };
  state.editMode = false;
  state.isModalOpen = true;
  apiError.value = "";
};

const closeModal = () => {
  state.isModalOpen = false;
  validationErrors.name = "";
  validationErrors.email = "";
  apiError.value = "";
};

const formatCreatedAt = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

const createUser = async () => {
  if (!validateUser()) return;

  try {
    await $fetch("/api/users", {
      method: "POST",
      body: { name: state.user.name, email: state.user.email },
    });
    closeModal();
    toast.success("User added to list successfully");
    await fetchUsers();
  } catch (error: any) {
    apiError.value =
      error.message || "An error occurred while creating the user.";
  }
};

const editUser = (selectedUser: User) => {
  state.user = { ...selectedUser };
  state.userId = selectedUser.id;
  state.editMode = true;
  state.isModalOpen = true;
  apiError.value = "";
};

const updateUser = async () => {
  if (!validateUser()) return;

  try {
    await $fetch(`/api/users/${state.userId}`, {
      method: "PUT",
      body: { name: state.user.name, email: state.user.email },
    });
    closeModal();
    toast.success("User updated successfully");
    await fetchUsers();
  } catch (error: any) {
    apiError.value =
      error.message || "An error occurred while updating the user.";
  }
};

const deleteUser = async (id: number) => {
  try {
    await $fetch(`/api/users/${id}`, { method: "DELETE" });
    toast.success("User deleted successfully");
    await fetchUsers();
  } catch (error: any) {
    apiError.value =
      error.message || "An error occurred while deleting the user.";
  }
};

onMounted(async () => {
  await fetchUsers();
});
</script>
  