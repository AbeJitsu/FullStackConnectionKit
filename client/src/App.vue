<template>
  <div id="app">
    <header>
      <!-- Uncomment if needed -->
      <!-- <h1>FullStack Connection Kit Tester</h1> -->
    </header>
    <main>
      <ApiTester />
    </main>
    <footer>
      <p>&copy; {{ currentYear }} Full Stack Connection Kit created by Abe Reyes</p>
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

<style scoped>
#app {
  font-family: 'Roboto', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 60%;
  margin: 60px auto;
  padding: 1rem ;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 1px 4px 12px rgba(0, 0, 0, 0.1);
}

header, main, footer {
  margin-bottom: 1rem;
}

h1 {
  color: #2c3e50;
  font-size: 2em;
  margin-bottom: 0.5em;
}

footer {
  font-size: 0.9em;
  color: #888;
  /* border-top: 1px solid #e0e0e0; */
  padding-top: 1em;
  margin-top: 1rem;
}

footer p {
  margin: 1rem;
}



main > *:first-child {
  margin-top: 1em;
}

main > *:last-child {
  margin-bottom: 1em;
}
</style>
