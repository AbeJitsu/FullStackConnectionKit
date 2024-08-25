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
      <input v-model="counterName" placeholder="Counter name" class="input-field">
      <button @click="performCounterOperation('increment')" class="button button-blue">Increment</button>
      <button @click="performCounterOperation('decrement')" class="button button-blue">Decrement</button>
      <button @click="performCounterOperation('reset')" class="button button-blue">Reset</button>
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
    },
    apiUrl: {
      type: String,
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
      eventSource: null
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
    async performCounterOperation(operation) {
      try {
        const response = await this.apiCall('post', `${this.apiUrl}/api/counter-operations`, {
          operation,
          name: this.counterName
        });
        this.counterStatus = `Operation '${operation}' successful. New value: ${response.counter.value}`;
      } catch (error) {
        this.handleError('Counter operation', error);
      }
    },
    toggleSSE() {
      if (this.sseActive) {
        this.eventSource.close();
        this.sseActive = false;
        this.sseStatus = 'SSE stopped';
      } else {
        this.eventSource = new EventSource(`${this.apiUrl}/api/sse`);
        this.eventSource.onmessage = (event) => {
          console.log('SSE message received:', event.data);
          const data = JSON.parse(event.data);
          this.sseStatus = `Received update: ${JSON.stringify(data)}`;
        };
        this.eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          this.sseStatus = `SSE connection failed: ${error.message || 'Unknown error'}`;
          this.sseActive = false;
          this.eventSource.close();
        };
        this.eventSource.onopen = () => {
          console.log('SSE connection opened');
          this.sseActive = true;
          this.sseStatus = 'SSE started';
        };
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