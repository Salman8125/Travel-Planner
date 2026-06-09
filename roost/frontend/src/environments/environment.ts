// Default backend URL for standalone `npm start`. In Docker this file is overwritten at
// build time from the API_URL build ARG (see Dockerfile). Must be http://localhost:<port>
// — the browser runs outside the docker network.
export const environment = { apiUrl: 'http://localhost:4002' };
