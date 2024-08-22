<template>
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
</template>

<script>
export default {
  name: 'ApiTestsPanel',
  props: {
    apiCall: {
      type: Function,
      required: true
    },
    apiUrl: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      databaseStatus: '',
      websocketStatus: '',
      corsStatus: ''
    };
  },
  methods: {
    async testDatabase() {
      try {
        const { status } = await this.apiCall('get', `${this.apiUrl}/api/info/database-status`);
        this.databaseStatus = `Database is ${status}`;
        this.$emit('database-status', this.databaseStatus);
      } catch (error) {
        this.handleError('Database test', error);
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
        this.$emit('websocket-status', this.websocketStatus);
      };

      ws.onmessage = (event) => {
        this.websocketStatus += `\nReceived: ${event.data}`;
        this.$emit('websocket-status', this.websocketStatus);
      };

      ws.onerror = (error) => {
        this.handleError('WebSocket test', error);
      };
    },
    async testCORS() {
      try {
        const getResponse = await this.apiCall('get', `${this.apiUrl}/api/cors-test`);
        const postResponse = await this.apiCall('post', `${this.apiUrl}/api/cors-test`, { test: 'data' });
        this.corsStatus = `GET: ${getResponse.message}\nPOST: ${postResponse.message}`;
        this.$emit('cors-status', this.corsStatus);
      } catch (error) {
        this.handleError('CORS test', error);
      }
    },
    handleError(testName, error) {
      const errorMessage = `${testName} failed: ${error.response?.status} ${error.response?.statusText || error.message}`;
      console.error(errorMessage);
      switch (testName) {
        case 'Database test':
          this.databaseStatus = errorMessage;
          this.$emit('database-status', this.databaseStatus);
          break;
        case 'WebSocket test':
          this.websocketStatus = errorMessage;
          this.$emit('websocket-status', this.websocketStatus);
          break;
        case 'CORS test':
          this.corsStatus = errorMessage;
          this.$emit('cors-status', this.corsStatus);
          break;
      }
    }
  }
};
</script>

<style scoped>
.api-tests {
  background-color: #ffe6e6;
}

.test-group {
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 10px;
}

.action-button {
  margin-bottom: 10px;
}

.status {
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>