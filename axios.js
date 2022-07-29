const axios = require('axios').default;
const { pteroUrl, pteroToken } = require('./config.json');

axios.defaults.baseURL = pteroUrl;
axios.defaults.headers.common['Authorization'] = `Bearer ${pteroToken}`;
axios.defaults.headers.common['Content-Type'] = "application/json";
axios.defaults.headers.common['Accept'] = "application/json";

module.exports = {

    SendSignal: async (server, state) => {
        await axios.post(`/api/client/servers/${server}/power`, { signal: state });
    },

    RequestServerStatus: async (server) => {
        try {
            return await axios.get(`/api/client/servers/${server}/resources`);
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    GetServerFromPort: async (port) => {
        try {
            let response = await axios.get("/api/client");
            let server = response.data.data.find(x => x.attributes.relationships.allocations.data.some((item) => item.attributes.port == port));
            return server;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}