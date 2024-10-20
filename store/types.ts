export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export interface ValidationErrors {
    name: string;
    email: string;
}

export interface State {
    users: User[];
    user: User;
    isLoading: boolean;
    isModalOpen: boolean;
    editMode: boolean;
    apiError: string;
    userId: number | null;
    validationErrors: ValidationErrors;
    isAuthenticated: boolean,
    token:string
}
