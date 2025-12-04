import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {CORE_SERVICE_URL} from '../config';

interface User {
    name: string,
    username: string,
    email: string,
    token: string
    sessionActive: boolean,
}

interface UserSlice {
    user: User,
    error: string,
    loading: boolean
}

const initialState: UserSlice = {
    user: {
        name: "",
        username: "",
        email: "",
        token: "",
        sessionActive: false,
    },
    error: "",
    loading: false,
};

export const login = createAsyncThunk(
    "user/login",
    async (props: {username: string, password: string}) => {
        try {
            const {username, password} = props;
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const requestBody = {
                username: username,
                password: password,
            };

            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            };

            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/login`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const fetchUser = createAsyncThunk(
    "user/fetchUser",
    async (username: string) => {
        try {
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const requestBody = {
                users: {
                    username: username
                },
            };

            const requestOptions = {
                method: 'GET',
                headers: headers,
                body: JSON.stringify(requestBody),
            };

            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/profile`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const createUserAccount = createAsyncThunk(
    "user/createAccount",
    async (props: {username: string, email: string, password: string, fullName: string}) => {
        try {
            const {username, email, password, fullName} = props;
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const requestBody = {
                username: username,
                email: email,
                password: password,
                fullName: fullName,
            };

            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            };

            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/register`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const verifyAccount = createAsyncThunk(
    "user/verifyAccount",
    async (token: string) => {
        try {
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const requestBody = {
                token: token
            };

            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            };

            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/verify-email`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const sendResetPasswordEmail = createAsyncThunk(
    "user/sendResetPasswordEmail",
    async (email: string) => {
        try {
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const requestBody = {
                email: email,
            };

            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            };

            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/forgot-password`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    "user/resetPassword",
    async (props: {token: string, password: string}) => {
        try {
            const {token, password} = props;
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const requestBody = {
                token: token,
                newPassword: password
            };

            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            };

            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/reset-password`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const deleteAccount = createAsyncThunk(
    "user/deleteAccount",
    async (props: {user: User, password: string}) => {
        try {
            const {user, password} = props;
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            headers.set('authorization', `Bearer ${user.token}`);

            const requestBody = {
                password: password,
                confirmation: "DELETE"
            };

            const requestOptions = {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(requestBody)
            };

            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/account`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const logout = createAsyncThunk(
    "user/logout",
    async (token) => {
        const headers = new Headers();
        headers.set('authorization', `Bearer ${token}`);
        const requestOptions = {
            method: 'POST',
            headers: headers,
        };

        try {
            const response = await fetch(`${CORE_SERVICE_URL}/api/auth/logout`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

const UserSlice = createSlice({
    name: "users",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.user) {
                    state.user = {
                        username: action.payload.user.username,
                        email: action.payload.user.email,
                        name: action.payload.user.fullName,
                        token: action.payload.token,
                        sessionActive: true
                    };
                }
                else {
                    state.error = action.payload.error;
                }
            })
            .addCase(login.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(createUserAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUserAccount.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.user) {
                    state.user = {
                        username: action.payload.user.username,
                        email: action.payload.user.email,
                        name: action.payload.user.fullName,
                        token: "",
                        sessionActive: false
                    };
                }
                else {
                    state.error = action.payload.error;
                }
            })
            .addCase(createUserAccount.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(verifyAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyAccount.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(verifyAccount.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(resetPassword.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(deleteAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAccount.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.error) {
                    state.error = action.payload.error;
                }
            })
            .addCase(deleteAccount.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(logout.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            });
    },
});

export default UserSlice.reducer;