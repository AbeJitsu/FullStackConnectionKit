import Vue from 'vue';
import App from './App.vue';

// Disable production tip
Vue.config.productionTip = false;

// Enable performance tracking in development
Vue.config.performance = process.env.NODE_ENV !== 'production';

// Global error handler
Vue.config.errorHandler = function (err, vm, info) {
  console.error('Vue Error:', err, info);
  // You could also send errors to a logging service here
};

// Enable Vue Devtools in development
if (process.env.NODE_ENV === 'development') {
  Vue.config.devtools = true;
}

// Initialize the Vue instance
new Vue({
  render: (h) => h(App),
}).$mount('#app');
