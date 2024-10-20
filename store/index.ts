// index.ts (Vuex Store)
import { createStore, ActionContext } from 'vuex';
import { formatDistanceToNow } from "date-fns";
import { useNuxtApp } from '#app';
import type { State, User, ValidationErrors } from './types';

export const store = createStore<State>({
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
        },
        isAuthenticated: false, 
        token: '', 
    },
    mutations: {
        SET_USERS(state: State, users: User[]) {
            state.users = users;
        },
        SET_LOADING(state: State, isLoading: boolean) {
            state.isLoading = isLoading;
        },
        SET_USER(state: State, user: User) {
            state.user = user;
        },
        SET_MODAL_OPEN(state: State, isOpen: boolean) {
            state.isModalOpen = isOpen;
        },
        SET_EDIT_MODE(state: State, isEditMode: boolean) {
            state.editMode = isEditMode;
        },
        SET_API_ERROR(state: State, error: string) {
            state.apiError = error;
        },
        SET_VALIDATION_ERRORS(state: State, { name, email }: ValidationErrors) {
            state.validationErrors.name = name;
            state.validationErrors.email = email;
        },
        ADD_USER(state: State, user: User) {
            state.users.push(user);
        },
        UPDATE_USER(state: State, updatedUser: User) {
            const index = state.users.findIndex(user => user.id === updatedUser.id);
            if (index !== -1) {
                state.users[index] = updatedUser;
            }
        },
        SET_AUTHENTICATED(state: State, isAuthenticated: boolean) {
            state.isAuthenticated = isAuthenticated;
        },
        SET_TOKEN(state: State, token: string) {
            state.token = token;
        },
    },
    actions: {
        async register({ commit }: ActionContext<State, State>, { email, name }: { email: string, name: string }) {
            commit('SET_VALIDATION_ERRORS', { name: '', email: '' });
        
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
            let validationErrors: { name?: string; email?: string } = {};
        
            if (!name) {
                validationErrors.name = 'Name is required.';
            } else if (name.length < 3) {
                validationErrors.name = 'Name must be at least 3 characters long.';
            }
        
            if (!email) {
                validationErrors.email = 'Email is required.';
            } else if (!emailPattern.test(email)) {
                validationErrors.email = 'Invalid email format.';
            }
        
            if (validationErrors.name || validationErrors.email) {
                commit('SET_VALIDATION_ERRORS', validationErrors);
                (useNuxtApp().$toast as { error: (msg: string) => void }).error('Validation errors occurred.');
                return;
            }
        
            try {
                const response = await $fetch('/api/auth/register', {
                    method: 'POST',
                    body: { email, name },
                });
        
                const router = useNuxtApp().$router;
        
                localStorage.setItem('token', response.token);
                commit('SET_AUTHENTICATED', true);
                commit('SET_TOKEN', response.token);
        
                router.push('/');
        
                commit('SET_VALIDATION_ERRORS', { name: '', email: '' });
        
                (useNuxtApp().$toast as { success: (msg: string) => void }).success('Registered successfully');
            } catch (error) {
                commit('SET_API_ERROR', 'Register failed.');
                (useNuxtApp().$toast as { error: (msg: string) => void }).error('Error during registration');
            }
        },
        
        async login({ commit }: ActionContext<State, State>, { email }: { email: string }) {
            try {
                const router = useNuxtApp().$router;
                const response = await $fetch('/api/auth/login', {
                    method: 'POST',
                    body: { email },
                });
                localStorage.setItem('token', response.token);
                commit('SET_AUTHENTICATED', true);
                commit('SET_TOKEN', response.token); // Save the token
                router.push('/');
                (useNuxtApp().$toast as { success: (msg: string) => void }).success('Login successful');
            } catch (error) {
                commit('SET_API_ERROR', 'Login failed.');
                (useNuxtApp().$toast as { error: (msg: string) => void }).error('Error during login');
            }
        },
        async fetchUsers({ commit, state }: ActionContext<State, State>) {
            commit('SET_LOADING', true);
            try {
                const response = await fetch('/api/users', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token in request
                    },
                });
                const users: User[] = await response.json();
                commit('SET_USERS', users);
            } catch (error) {
                commit('SET_API_ERROR', 'Failed to fetch users.');
                (useNuxtApp().$toast as { error: (msg: string) => void }).error('Error fetching users');
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async createUser({ commit, dispatch, state }: ActionContext<State, State>, user: User) {
            const isValid = validateUser(state);
            if (!isValid) return;

            try {
                const response: User = await $fetch('/api/users', {
                    method: 'POST',
                    body: user,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token in request
                    },
                });
                commit('ADD_USER', response);
                dispatch('closeModal');
                (useNuxtApp().$toast as { success: (msg: string) => void }).success('User created successfully');
            } catch (error) {
                (useNuxtApp().$toast as { error: (msg: string) => void }).error('Error creating user');
                throw error;
            }
        },
        async updateUser({ commit, dispatch, state }: ActionContext<State, State>, user: User) {
            const isValid = validateUser(state);
            if (!isValid) return;

            try {
                const response: User = await $fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    body: user,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token in request
                    },
                });
                commit('UPDATE_USER', response);
                dispatch('closeModal');
                (useNuxtApp().$toast as { success: (msg: string) => void }).success('User updated successfully');
            } catch (error) {
                (useNuxtApp().$toast as { error: (msg: string) => void }).error('Error updating user');
                throw error;
            }
        },
        async deleteUser({ dispatch, commit, state }: ActionContext<State, State>, id: number) {
            try {
                await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token in request
                    },
                });
                dispatch('fetchUsers');
                (useNuxtApp().$toast as { success: (msg: string) => void }).success('User deleted successfully');
            } catch (error) {
                commit('SET_API_ERROR', 'Failed to delete user.');
                (useNuxtApp().$toast as { error: (msg: string) => void }).error('Error deleting user');
            }
        },
        openModal({ commit }: ActionContext<State, State>) {
            commit('SET_USER', { id: 0, name: '', email: '', createdAt: '' });
            commit('SET_EDIT_MODE', false);
            commit('SET_MODAL_OPEN', true);
            commit('SET_API_ERROR', '');
        },
        editUser({ commit }: ActionContext<State, State>, selectedUser: User) {
            commit('SET_USER', { ...selectedUser });
            commit('SET_EDIT_MODE', true);
            commit('SET_MODAL_OPEN', true);
            commit('SET_API_ERROR', '');
        },
        closeModal({ commit }: ActionContext<State, State>) {
            commit('SET_MODAL_OPEN', false);
            commit('SET_VALIDATION_ERRORS', { name: '', email: '' });
            commit('SET_API_ERROR', '');
        }
    },
    getters: {
        getUsers: (state: State) => state.users,
        getUser: (state: State) => state.user,
        isLoading: (state: State) => state.isLoading,
        isModalOpen: (state: State) => state.isModalOpen,
        isEditMode: (state: State) => state.editMode,
        getValidationErrors: (state: State) => state.validationErrors,
        getApiError: (state: State) => state.apiError,
        isAuthenticated: (state: State) => state.isAuthenticated, // New getter
        getToken: (state: State) => state.token, // New getter
        formatCreatedAt: () => (dateString: string) => {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        }
    }
});

const validateUser = (state: State): boolean => {
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
