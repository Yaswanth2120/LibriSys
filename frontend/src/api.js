import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

export const signup = async (userData) => {
    return axios.post(`${API_BASE_URL}/auth/signup`, userData);
};

export const login = async (credentials) => {
    return axios.post(`${API_BASE_URL}/auth/login`, credentials);
};

export const getProfile = async (token) => {
    return axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
