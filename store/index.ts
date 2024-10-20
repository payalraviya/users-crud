// store/index.ts
import { createStore } from 'vuex';
import { formatDistanceToNow } from "date-fns";

export const store = createStore({
    state: {
        users: [],
        user: {
            id: 0,
            name: '',
            email: '',
            createdAt: ''
        },
        isLoading: true,
        isModalOpen: false,
        editMode: false,
        apiError: '',
        userId: null,
        validationErrors: {
            name: '',
            email: ''
        }
    },
    mutations: {
        SET_USERS(state, users) {
            state.users = users;
        },
        SET_LOADING(state, isLoading) {
            state.isLoading = isLoading;
        },
        SET_USER(state, user) {
            state.user = user;
        },
        SET_MODAL_OPEN(state, isOpen) {
            state.isModalOpen = isOpen;
        },
        SET_EDIT_MODE(state, isEditMode) {
            state.editMode = isEditMode;
        },
        SET_API_ERROR(state, error) {
            state.apiError = error;
        },
        SET_VALIDATION_ERRORS(state, { name, email }) {
            state.validationErrors.name = name;
            state.validationErrors.email = email;
        },
        ADD_USER(state, user) {
            state.users.push(user); // Add new user to the users array
        },
        UPDATE_USER(state, updatedUser) {
            const index = state.users.findIndex(user => user.id === updatedUser.id);
            if (index !== -1) {
                // Update the existing user in the state
                state.users[index] = updatedUser;
            }
        },
    },
    actions: {
        async fetchUsers({ commit }) {
            commit('SET_LOADING', true);
            try {
                const response = await fetch('/api/users');
                const users = await response.json();
                commit('SET_USERS', users);
            } catch (error) {
                commit('SET_API_ERROR', 'Failed to fetch users.');
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async createUser({ commit, dispatch }, user) {
            try {
                const response = await $fetch('/api/users', {
                    method: 'POST',
                    body: user,
                });
                commit('ADD_USER', response); // Commit mutation to add user to state
                dispatch('closeModal');
            } catch (error) {
                console.error('Error creating user:', error);
                throw error;
            }
            
        },
        async updateUser({ commit, dispatch }, user) {
            try {
                console.log("hellllllllllllll")
                const response = await $fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    body: user,
                });
                commit('UPDATE_USER', response); // Commit mutation to update user in state
                dispatch('closeModal');
            } catch (error) {
                console.error('Error updating user:', error);
                throw error;
            }
        },
        async deleteUser({ dispatch, commit }, id) {
            try {
                await fetch(`/api/users/${id}`, {
                    method: 'DELETE'
                });
                dispatch('fetchUsers');
            } catch (error) {
                commit('SET_API_ERROR', 'Failed to delete user.');
            }
        },
        openModal({ commit }) {
            commit('SET_USER', { id: 0, name: '', email: '', createdAt: '' });
            commit('SET_EDIT_MODE', false);
            commit('SET_MODAL_OPEN', true);
            commit('SET_API_ERROR', '');
        },
        editUser({ commit }, selectedUser) {
            commit('SET_USER', { ...selectedUser });
            commit('SET_EDIT_MODE', true);
            commit('SET_MODAL_OPEN', true);
            commit('SET_API_ERROR', '');
        },
        closeModal({ commit }) {
            commit('SET_MODAL_OPEN', false);
            commit('SET_VALIDATION_ERRORS', { name: '', email: '' });
            commit('SET_API_ERROR', '');
        }
    },
    getters: {
        getUsers: (state) => state.users,
        getUser: (state) => state.user,
        isLoading: (state) => state.isLoading,
        isModalOpen: (state) => state.isModalOpen,
        isEditMode: (state) => state.editMode,
        getValidationErrors: (state) => state.validationErrors,
        getApiError: (state) => state.apiError,
        formatCreatedAt: () => (dateString: string) => {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        }
    }
});

const validateUser = (state) => {
    let isValid = true;
    state.validationErrors.name = '';
    state.validationErrors.email = '';

    if (state.user.name.length < 3 || state.user.name.length > 100) {
        state.validationErrors.name = 'Name must be between 3 and 100 characters.';
        isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(state.user.email)) {
        state.validationErrors.email = 'Please enter a valid email address.';
        isValid = false;
    }

    return isValid;
};
