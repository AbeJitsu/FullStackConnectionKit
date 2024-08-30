<template>
  <section class="panel api-tests">
    <h2>API Tests</h2>
    <div class="test-group">
      <h3>Database Test</h3>
      <button @click="testDatabase" class="button button-green">Test Database Connection</button>
      <p class="status">{{ databaseStatus }}</p>
    </div>
    <div class="test-group">
      <h3>CORS Test</h3>
      <button @click="testCORS" class="button button-green">Test CORS</button>
      <p class="status">{{ corsStatus }}</p>
    </div>
    <div class="test-group">
      <h3>Counter Operations (ODF)</h3>
      <input v-model="counterName" placeholder="Counter name" class="input-field" required>
      <button @click="performCounterOperation('increment')" class="button button-blue" :disabled="!counterName">Increment</button>
      <button @click="performCounterOperation('decrement')" class="button button-blue" :disabled="!counterName">Decrement</button>
      <button @click="performCounterOperation('reset')" class="button button-blue" :disabled="!counterName">Reset</button>
      <p class="status">{{ counterStatus }}</p>
    </div>
    <div class="test-group">
      <h3>SSE Updates</h3>
      <button @click="toggleSSE" class="button" :class="{ 'button-green': !sseActive, 'button-red': sseActive }">
        {{ sseActive ? 'Stop' : 'Start' }} SSE
      </button>
      <p class="status">{{ sseStatus }}</p>
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
    }
  },
  data() {
    return {
      databaseStatus: '',
      corsStatus: '',
      counterName: '',
      counterStatus: '',
      sseActive: false,
      sseStatus: '',
      eventSource: null,
      reconnectTimeout: null,
      apiUrl: process.env.NODE_ENV === 'production'
        ? process.env.VUE_APP_API_URL_CLOUD
        : process.env.VUE_APP_API_URL_LOCAL
    };
  },
  beforeDestroy() {
    this.stopSSE();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  },
  methods: {
    clearStatus() {
      this.databaseStatus = '';
      this.corsStatus = '';
      this.counterStatus = '';
      this.sseStatus = '';
    },
    async testDatabase() {
      this.clearStatus();
      try {
        const { status } = await this.apiCall('get', `${this.apiUrl}/api/info/database-status`);
        this.databaseStatus = `Database is ${status}`;
        this.$emit('database-status', this.databaseStatus);
      } catch (error) {
        this.handleError('Database test', error);
      }
    },
    async testCORS() {
      this.clearStatus();
      try {
        const getResponse = await this.apiCall('get', `${this.apiUrl}/api/cors-test`);
        const postResponse = await this.apiCall('post', `${this.apiUrl}/api/cors-test`, { test: 'data' });
        this.corsStatus = `GET: ${getResponse.message}\nPOST: ${postResponse.message}`;
        this.$emit('cors-status', this.corsStatus);
      } catch (error) {
        this.handleError('CORS test', error);
      }
    },
    async performCounterOperation(operation) {
      this.clearStatus();
      if (!this.counterName) {
        this.counterStatus = 'Please enter a counter name';
        return;
      }
      try {
        const response = await this.apiCall('post', `${this.apiUrl}/api/counter-operations`, {
          operation,
          name: this.counterName
        });
        this.counterStatus = `Operation '${operation}' successful. New value: ${response.counter.value}`;
        console.log('Counter operation response:', response);
      } catch (error) {
        console.error('Counter operation error:', error);
        this.handleError('Counter operation', error);
      }
    },
    toggleSSE() {
      this.clearStatus();
      if (this.sseActive) {
        this.stopSSE();
      } else {
        this.startSSE();
      }
    },
    startSSE() {
      if (this.eventSource) {
        this.stopSSE(); // Ensure any existing connection is closed
      }
      this.eventSource = new EventSource(`${this.apiUrl}/api/sse`);
      this.setupSSEListeners();
    },
    setupSSEListeners() {
      this.eventSource.onmessage = this.handleSSEMessage;
      this.eventSource.onerror = this.handleSSEError;
      this.eventSource.onopen = this.handleSSEOpen;
      
      this.eventSource.addEventListener('counter-update', this.handleCounterUpdate);
    },
    stopSSE() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      this.sseActive = false;
    },
    handleSSEMessage(event) {
      console.log('SSE message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.sseStatus = `Received update: ${JSON.stringify(data)}`;
      } catch (error) {
        console.error('Error parsing SSE message:', error);
        this.sseStatus = `Error parsing SSE message: ${error.message}`;
      }
    },
    handleSSEError(error) {
      console.error('SSE Error:', error);
      console.error('SSE readyState:', this.eventSource?.readyState);
      this.sseStatus = `SSE connection failed: ${error.message || 'Unknown error'}`;
      this.sseActive = false;
      
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      
      this.$nextTick(() => {
        this.scheduleReconnect();
      });
    },
    scheduleReconnect() {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      this.reconnectTimeout = setTimeout(() => {
        if (!this.sseActive) {
          this.startSSE();
        }
      }, 5000);
    },
    handleSSEOpen() {
      console.log('SSE connection opened');
      this.sseActive = true;
      this.sseStatus = 'SSE started';
    },
    handleCounterUpdate(event) {
      const data = JSON.parse(event.data);
      this.counterStatus = `Counter '${data.name}' updated. New value: ${data.value}`;
    },
    handleError(testName, error) {
      const errorMessage = `${testName} failed: ${error.response?.status} ${error.response?.statusText || error.message}`;
      console.error(errorMessage);
      switch (testName) {
        case 'Database test':
          this.databaseStatus = errorMessage;
          this.$emit('database-status', this.databaseStatus);
          break;
        case 'CORS test':
          this.corsStatus = errorMessage;
          this.$emit('cors-status', this.corsStatus);
          break;
        case 'Counter operation':
          this.counterStatus = errorMessage;
          break;
        case 'SSE connection':
          this.sseStatus = errorMessage;
          break;
      }
    }
  }
};
</script>

<style scoped>
@import '../styles/sharedStyles.css';

.input-field {
  width: auto;
  margin-right: 10px;
}

.button-blue {
  background-color: var(--button-purple);
  color: var(--button-text);
  border: 2px solid var(--muted-grey);
}

.button-blue:hover {
  background-color: var(--button-purple-hover);
}

.test-group {
  margin-bottom: 20px;
}

.test-group h3 {
  margin-bottom: 10px;
}

.status {
  margin-top: 10px;
  font-style: italic;
}
</style>