import axios from 'axios';

// Base URL configuration
const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

// Function to perform a GET request and manage loading state
export const fetchData = async (url) => {
    try {
        const response = await instance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return { isLoading: false, error: true };
    }
};

// Function to perform a POST request and manage loading state
export const postData = async (postData,url) => {
    try {
        console.log(postData,url)
        const response = await instance.post(url, postData);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        return { isLoading: false, error: true };
    }
};

// Additional functions for PUT, DELETE, etc., can be defined similarly
