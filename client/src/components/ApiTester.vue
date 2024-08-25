<template>
  <div class="container">
    <h1>FullStackConnectionKit API Tester</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="grid">
      <section class="panel system-info">
        <h2>System Information</h2>
        <div>
          <p v-for="(info, key) in sections[0].info" :key="key">
            <strong>{{ key }}:</strong> {{ info }}
          </p>
        </div>
      </section>

      <ApiTestsPanel 
        :apiCall="apiCall"
        :apiUrl="apiUrl"
        @database-status="updateDatabaseStatus"
        @cors-status="updateCorsStatus"
      />

      <section class="panel create-item">
        <h2>Create Item</h2>
        <form @submit.prevent="createItem">
          <div>
            <label for="item-name">Item name:</label>
            <input id="item-name" v-model="newItem.name" type="text" class="input-field" required />
          </div>
          <div>
            <label for="item-description">Description:</label>
            <input id="item-description" v-model="newItem.description" type="text" class="input-field" />
          </div>
          <div>
            <label for="item-quantity">Quantity:</label>
            <input id="item-quantity" v-model.number="newItem.quantity" type="number" class="input-field" required min="0" />
          </div>
          <div>
            <label for="item-price">Price:</label>
            <input id="item-price" v-model.number="newItem.price" type="number" class="input-field" required min="0" step="0.01" />
          </div>
          <button type="submit" :disabled="!isFormValid" class="button button-red">Create Item</button>
        </form>
      </section>

      <section class="panel items">
        <h2>Items</h2>
        <ul v-if="items.length" class="item-list">
          <li v-for="item in items" :key="item._id">
            {{ item.name }}: {{ item.description }} (Quantity: {{ item.quantity }}, Price: ${{ item.price }})
            <button @click="deleteItem(item._id)" class="button delete-button">Delete</button>
          </li>
        </ul>
        <p v-else>No items found.</p>
        <p class="total-quantity"><strong>Total Quantity:</strong> {{ totalQuantity }}</p>
        <button @click="fetchItems" class="button refresh-button">Refresh Items</button>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ApiTestsPanel from './ApiTestsPanel.vue';

const axiosInstance = axios.create({
  withCredentials: true,
});

export default {
  name: 'ApiTester',
  components: {
    ApiTestsPanel
  },
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
      corsStatus: '',
      items: [],
      newItem: {
        name: '',
        description: '',
        quantity: 0,
        price: 0
      }
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
    updateDatabaseStatus(status) {
      this.databaseStatus = status;
    },
    updateCorsStatus(status) {
      this.corsStatus = status;
    },
  },
};
</script>

<style scoped>
@import '../styles/sharedStyles.css';
</style>