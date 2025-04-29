// deno-lint-ignore-file no-explicit-any
import axios from "axios";
import config from "./config.json" with { type: "json" };

const { pteroUrl, pteroToken } = config;

axios.defaults.baseURL = pteroUrl;
axios.defaults.headers.common["Authorization"] = `Bearer ${pteroToken}`;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

export const SendSignal = async (server: any, state: any) => {
  await axios.post(`/api/client/servers/${server}/power`, { signal: state });
};

export const RequestServerStatus = async (server: any) => {
  try {
    return await axios.get(`/api/client/servers/${server}/resources`);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const GetServerFromPort = async (port: string) => {
  try {
    const response = await axios.get("/api/client");
    const server = response.data.data.find((x: any) =>
      x.attributes.relationships.allocations.data.some((item: any) =>
        item.attributes.port == port
      )
    );
    return server;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const GetAllServers = async () => {
  try {
    const response = await axios.get("/api/client?include=egg");
    const servers = response.data.data.filter((x: any) =>
      x.attributes.name.toLowerCase().includes("minecraft")
    );
    return servers;
  } catch (error) {
    console.error(error);
    return null;
  }
};
