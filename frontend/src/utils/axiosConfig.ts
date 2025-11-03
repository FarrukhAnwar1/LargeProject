import axios from 'axios';

// Configure axios to always send credentials with requests
axios.defaults.withCredentials = true;

// Set default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';