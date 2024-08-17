<template>
  <div class="api-tester">
    <h1>FullStackConnectionKit API Tester</h1>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <section class="info">
        <h2>System Information</h2>
        <p><strong>Client:</strong> {{ clientInfo }}</p>
        <p><strong>Server:</strong> {{ serverInfo.port }}</p>
        <p><strong>Database:</strong> {{ databaseInfo.uri }}</p>
        <p><strong>API Connection Status:</strong> {{ connectionStatus }}</p>
      </section>

      <section class="database-test">
        <h2>Database Test</h2>
        <button @click="testDatabase">Test Database Connection</button>
        <p>{{ databaseStatus }}</p>
      </section>

      <section class="websocket-test">
        <h2>WebSocket Test</h2>
        <button @click="testWebSocket">Test WebSocket</button>
        <p>{{ websocketStatus }}</p>
      </section>

      <section class="cors-test">
        <h2>CORS Test</h2>
        <button @click="testCORS">Test CORS</button>
        <p>{{ corsStatus }}</p>
      </section>

      <section class="item-creator">
        <h2>Create Item</h2>
        <form @submit.prevent="createItem">
          <input v-model.trim="newItem.name" placeholder="Item name" required>
          <input v-model.trim="newItem.description" placeholder="Item description">
          <input v-model.number="newItem.quantity" type="number" placeholder="Quantity" required min="0">
          <button type="submit" :disabled="!isFormValid">Create Item</button>
        </form>
      </section>

      <section class="item-list">
        <h2>Items</h2>
        <ul v-if="items.length">
          <li v-for="item in items" :key="item._id">
            {{ item.name }}: {{ item.description }} (Quantity: {{ item.quantity }})
            <button @click="deleteItem(item._id)">Delete</button>
          </li>
        </ul>
        <p v-else>No items found.</p>
        <p><strong>Total Quantity:</strong> {{ totalQuantity }}</p>
      </section>

      <button @click="fetchItems">Refresh Items</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ApiTester",
  data() {
    return {
      loading: true,
      clientInfo: `Running on ${window.location.origin}`,
      serverInfo: {},
      databaseInfo: {},
      connectionStatus: "Not connected",
      databaseStatus: '',
      websocketStatus: '',
      corsStatus: '',
      items: [],
      newItem: {
        name: '',
        description: '',
        quantity: 0
      },
      apiUrl: process.env.VUE_APP_USE_CLOUD === "true"
        ? process.env.VUE_APP_API_URL_CLOUD
        : process.env.VUE_APP_API_URL_LOCAL,
    };
  },
  computed: {
    totalQuantity() {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    isFormValid() {
      return this.newItem.name.trim() !== '' && this.newItem.quantity >= 0;
    }
  },
  async mounted() {
    await this.fetchInfo();
    await this.fetchItems();
  },
  methods: {
    async fetchInfo() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/info`);
        const { serverInfo, databaseInfo } = response.data;
        this.serverInfo = serverInfo;
        this.databaseInfo = databaseInfo;
        this.connectionStatus = "Connected successfully";
        this.loading = false;
      } catch (error) {
        console.error("Error fetching info:", error);
        this.connectionStatus = "Error connecting to server";
        this.loading = false;
      }
    },
    async createItem() {
      try {
        await axios.post(`${this.apiUrl}/api/items`, this.newItem);
        this.connectionStatus = "Item created successfully";
        this.newItem = { name: '', description: '', quantity: 0 };
        await this.fetchItems();
      } catch (error) {
        this.connectionStatus = "Error creating item: " + (error.response?.data?.message || error.message);
      }
    },
    async fetchItems() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/items`);
        this.items = response.data.items;
        this.connectionStatus = "Items fetched successfully";
      } catch (error) {
        console.error('Error fetching items:', error);
        this.connectionStatus = "Error fetching items: " + (error.response?.data?.message || error.message);
      }
    },
    async deleteItem(id) {
      try {
        await axios.delete(`${this.apiUrl}/api/items/${id}`);
        this.connectionStatus = "Item deleted successfully";
        await this.fetchItems();
      } catch (error) {
        this.connectionStatus = "Error deleting item: " + (error.response?.data?.message || error.message);
      }
    },
    async testDatabase() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/info/database-status`);
        this.databaseStatus = `Database is ${response.data.status}`;
      } catch (error) {
        this.databaseStatus = `Database test failed: ${error.message}`;
      }
    },
    testWebSocket() {
      const ws = new WebSocket(`ws://${window.location.hostname}:${process.env.VUE_APP_WS_PORT || 3000}`);
      ws.onopen = () => {
        this.websocketStatus = 'WebSocket connected';
        ws.send('Hello, WebSocket!');
      };
      ws.onmessage = (event) => {
        this.websocketStatus += `\nReceived: ${event.data}`;
      };
      ws.onerror = (error) => {
        this.websocketStatus = `WebSocket error: ${error.message}`;
      };
    },
    async testCORS() {
      try {
        const getResponse = await axios.get(`${this.apiUrl}/api/cors-test`);
        const postResponse = await axios.post(`${this.apiUrl}/api/cors-test`, { test: 'data' });
        this.corsStatus = `GET: ${getResponse.data.message}\nPOST: ${postResponse.data.message}`;
      } catch (error) {
        this.corsStatus = `CORS test failed: ${error.message}`;
      }
    },
  },
};
</script>

<style scoped>
.api-tester {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
h1, h2 {
  color: #333;
}
section {
  margin-bottom: 20px;
}
button, input {
  width: 100%;
  margin: 5px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>