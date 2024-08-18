<template>
  <div id="app">
    <header>
      <!-- <h1>FullStackConnectionKit Tester</h1> -->
    </header>
    <main>
      <ApiTester />
    </main>
    <footer>
      <p>&copy; {{ currentYear }} FullStackConnectionKit</p>
    </footer>
  </div>
</template>

<script>
import ApiTester from './components/ApiTester.vue'

export default {
  name: 'App',
  components: {
    ApiTester
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

header, main, footer {
  margin-bottom: 20px;
}

h1 {
  color: #2c3e50;
}

footer {
  font-size: 0.8em;
  color: #666;
}
</style>