<template>
  <div>
    <section class="panel create-item">
      <form @submit.prevent="createItem">
        <input v-model="newItem.name" placeholder="Name" required>
        <input v-model="newItem.description" placeholder="Description">
        <input v-model.number="newItem.quantity" type="number" placeholder="Quantity" required>
        <input v-model.number="newItem.price" type="number" step="0.01" placeholder="Price" required>
        <button type="submit" :disabled="!isFormValid">Create Item</button>
      </form>
    </section>
    <section class="panel items">
      <ul>
        <li v-for="item in items" :key="item._id">
          {{ item.name }} - Quantity: {{ item.quantity }}, Price: ${{ item.price }}
          <button @click="deleteItem(item._id)">Delete</button>
        </li>
      </ul>
      <p>Total Quantity: {{ totalQuantity }}</p>
      <button @click="fetchItems">Refresh Items</button>
    </section>
  </div>
</template>

<script>
import { apiCall } from '@/services/api';

export default {
  name: 'ItemManager',
  props: ['apiUrl'],
  data() {
    return {
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
    }
  },
  mounted() {
    this.fetchItems().catch(error => console.error('Error in mounted hook:', error));
  },
  methods: {
    async createItem() {
      try {
        await apiCall('post', `${this.apiUrl}/api/items`, this.newItem);
        this.newItem = { name: '', description: '', quantity: 0, price: 0 };
        await this.fetchItems();
      } catch (error) {
        console.error('Error creating item:', error);
      }
    },
    async fetchItems() {
      try {
        const response = await this.apiCall('get', `${this.apiUrl}/api/items`);
        this.items = Array.isArray(response) ? response : response.items || [];
      } catch (error) {
        console.error('Error fetching items:', error);
        this.items = [];
      }
    },
    async deleteItem(id) {
      try {
        await apiCall('delete', `${this.apiUrl}/api/items/${id}`);
        await this.fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>