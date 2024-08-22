<template>
  <div class="api-tester">
    <h1>FullStackConnectionKit API Tester</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="dashboard-grid">
      <section class="dashboard-item system-info">
        <h2>System Information</h2>
        <div class="info-grid">
          <p v-for="(info, key) in sections[0].info" :key="key">
            <strong>{{ key }}:</strong> {{ info }}
          </p>
        </div>
      </section>

      <section class="dashboard-item api-tests">
        <h2>API Tests</h2>
        <div class="test-group">
          <h3>Database Test</h3>
          <button @click="testDatabase" class="action-button">Test Database Connection</button>
          <p class="status">{{ databaseStatus }}</p>
        </div>
        <div class="test-group">
          <h3>WebSocket Test</h3>
          <button @click="testWebSocket" class="action-button">Test WebSocket</button>
          <p class="status">{{ websocketStatus }}</p>
        </div>
        <div class="test-group">
          <h3>CORS Test</h3>
          <button @click="testCORS" class="action-button">Test CORS</button>
          <p class="status">{{ corsStatus }}</p>
        </div>
      </section>

      

      <section class="dashboard-item create-item">
  <h2>Create Item</h2>
  <form @submit.prevent="createItem">
    <div class="form-group">
      <label for="item-name">Item name:</label>
      <input id="item-name" v-model="newItem.name" type="text" required />
    </div>
    <div class="form-group">
      <label for="item-description">Description:</label>
      <input id="item-description" v-model="newItem.description" type="text" />
    </div>
    <div class="form-group">
      <label for="item-quantity">Quantity:</label>
      <input id="item-quantity" v-model.number="newItem.quantity" type="number" required min="0" />
    </div>
    <div class="form-group">
      <label for="item-price">Price:</label>
      <input id="item-price" v-model.number="newItem.price" type="number" required min="0" step="0.01" />
    </div>
    <button type="submit" :disabled="!isFormValid" class="submit-button">Create Item</button>
  </form>
</section>

      <section class="dashboard-item item-list">
        <h2>Items</h2>
        <ul v-if="items.length">
          <li v-for="item in items" :key="item._id">
            {{ item.name }}: {{ item.description }} (Quantity: {{ item.quantity }}, Price: ${{ item.price }})
            <button @click="deleteItem(item._id)" class="delete-button">Delete</button>
          </li>
        </ul>
        <p v-else>No items found.</p>
        <p><strong>Total Quantity:</strong> {{ totalQuantity }}</p>
        <button @click="fetchItems" class="refresh-button">Refresh Items</button>
      </section>

    
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const axiosInstance = axios.create({
  withCredentials: true,
});

export default {
  name: 'ApiTester',
  data() {
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? process.env.VUE_APP_API_URL_CLOUD
      : process.env.VUE_APP_API_URL_LOCAL;

    return {
      loading: true,
      apiUrl,
      clientInfo: `Running on ${window.location.origin}`,
      serverInfo: {},
      databaseInfo: {},
      connectionStatus: 'Not connected',
      databaseStatus: '',
      websocketStatus: '',
      corsStatus: '',
      items: [],
      newItem: {
        name: '',
        description: '',
        quantity: 0,
        price: 0,
      },
    };
  },
  computed: {
    totalQuantity() {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    isFormValid() {
      return (
        this.newItem.name.trim() !== '' &&
        this.newItem.quantity >= 0 &&
        this.newItem.price >= 0
      );
    },
    sections() {
      return [
        {
          title: 'System Information',
          info: {
            Client: this.clientInfo,
            Server: this.serverInfo.port,
            Database: this.databaseInfo.uri,
            'API Connection Status': this.connectionStatus,
          },
        },
      ];
    },
  },
  async mounted() {
    await this.fetchInfo();
    await this.fetchItems();
    this.loading = false;
  },
  methods: {
    async apiCall(method, url, data = null) {
      try {
        console.log(`Making ${method.toUpperCase()} request to ${url}`);
        if (data) {
          console.log('Request data:', JSON.stringify(data, null, 2));
        }
        const response = await axiosInstance[method](url, data);
        console.log('Response:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Error in API call (${method} ${url}):`, error);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
        throw error;
      }
    },
    async fetchInfo() {
      try {
        const { serverInfo, databaseInfo } = await this.apiCall('get', `${this.apiUrl}/api/info`);
        this.serverInfo = serverInfo;
        this.databaseInfo = databaseInfo;
        this.connectionStatus = 'Connected successfully';
      } catch (error) {
        this.connectionStatus = `Error connecting to server: ${error.response?.status} ${error.response?.statusText || error.message}`;
      }
    },
    async createItem() {
      try {
        await this.apiCall('post', `${this.apiUrl}/api/items`, this.newItem);
        this.connectionStatus = 'Item created successfully';
        this.newItem = { name: '', description: '', quantity: 0, price: 0 };
        await this.fetchItems();
      } catch (error) {
        this.connectionStatus = `Error creating item: ${error.response?.status} ${error.response?.statusText || error.message}`;
      }
    },
    async fetchItems() {
      try {
        const { items } = await this.apiCall('get', `${this.apiUrl}/api/items`);
        this.items = items;
        this.connectionStatus = 'Items fetched successfully';
      } catch (error) {
        this.connectionStatus = `Error fetching items: ${error.response?.status} ${error.response?.statusText || error.message}`;
      }
    },
    async deleteItem(id) {
      try {
        await this.apiCall('delete', `${this.apiUrl}/api/items/${id}`);
        this.connectionStatus = 'Item deleted successfully';
        await this.fetchItems();
      } catch (error) {
        this.connectionStatus = `Error deleting item: ${error.response?.status} ${error.response?.statusText || error.message}`;
      }
    },
    async testDatabase() {
      try {
        const { status } = await this.apiCall('get', `${this.apiUrl}/api/info/database-status`);
        this.databaseStatus = `Database is ${status}`;
      } catch (error) {
        this.databaseStatus = `Database test failed: ${error.response?.status} ${error.response?.statusText || error.message}`;
      }
    },
    testWebSocket() {
      const isProduction = process.env.NODE_ENV === 'production';
      const protocol = isProduction ? 'wss://' : 'ws://';
      const host = isProduction ? window.location.host : `${window.location.hostname}:${process.env.VUE_APP_BACKEND_PORT}`;
      
      const ws = new WebSocket(`${protocol}${host}`);

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
        const getResponse = await this.apiCall('get', `${this.apiUrl}/api/cors-test`);
        const postResponse = await this.apiCall('post', `${this.apiUrl}/api/cors-test`, { test: 'data' });
        this.corsStatus = `GET: ${getResponse.message}\nPOST: ${postResponse.message}`;
      } catch (error) {
        this.corsStatus = `CORS test failed: ${error.response?.status} ${error.response?.statusText || error.message}`;
      }
    },
  },
};
</script>

<style scoped>
.api-tester {
  max-width: 1200px;
  min-width: 70%;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
  }

.dashboard-item {
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.system-info {
  background-color: #e6f3ff;
}

.api-tests {
  background-color: #ffe6e6;
}

.create-item {
  background-color: #e6ffe6;
}

.item-list {
  background-color: #fff6e6;
}

h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
}

button {
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #555;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.input-group label {
  flex: 0 0 80px;
}

.input-group input {
  flex: 1;
  margin-bottom: 0;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  background-color: white;
  border-radius: 5px;
  padding: 10px;
    border-radius: 5px; /* Rounded edges */
    margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-button {
  background-color: #ff6b6b;
  padding: 5px 10px;
  font-size: 0.9em;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.refresh-button {
  background-color: #4CAF50;
}

.loading {
  text-align: center;
  font-size: 1.2em;
  margin-top: 50px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.form-group label {
    flex: 0 0 100px; /* Adjust this width as needed for your labels */
    margin-right: 10px; /* Space between label and input */
    text-align: right;
}

.form-group input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.submit-button {
    margin-left: 110px; /* Aligns with input fields */
}
</style>
