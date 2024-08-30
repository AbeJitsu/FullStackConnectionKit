import Vue from 'vue';
import App from '@/App.vue';

// Mock Vue and App
jest.mock('vue');
jest.mock('@/App.vue');

describe('main.js', () => {
  let originalNodeEnv;
  let consoleSpy;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('disables production tip', () => {
    require('../main');
    expect(Vue.config.productionTip).toBe(false);
  });

  it('enables performance tracking in development', () => {
    process.env.NODE_ENV = 'development';
    require('../main');
    expect(Vue.config.performance).toBe(true);
  });

  it('disables performance tracking in production', () => {
    process.env.NODE_ENV = 'production';
    require('../main');
    expect(Vue.config.performance).toBe(false);
  });

  it('sets up global error handler', () => {
    require('../main');
    expect(Vue.config.errorHandler).toBeDefined();

    const mockError = new Error('Test error');
    const mockVm = {};
    const mockInfo = 'Error info';

    Vue.config.errorHandler(mockError, mockVm, mockInfo);
    expect(consoleSpy).toHaveBeenCalledWith('Vue Error:', mockError, mockInfo);
  });

  it('enables Vue Devtools in development', () => {
    process.env.NODE_ENV = 'development';
    require('../main');
    expect(Vue.config.devtools).toBe(true);
  });

  it('does not enable Vue Devtools in production', () => {
    process.env.NODE_ENV = 'production';
    require('../main');
    expect(Vue.config.devtools).toBeUndefined();
  });

  it('initializes Vue instance with App component', () => {
    const mockMount = jest.fn();
    Vue.mockImplementation(() => ({
      $mount: mockMount,
    }));

    require('../main');

    expect(Vue).toHaveBeenCalledWith({
      render: expect.any(Function),
    });
    expect(mockMount).toHaveBeenCalledWith('#app');
  });

  it('renders App component', () => {
    const mockRender = jest.fn();
    Vue.mockImplementation(() => ({
      $mount: jest.fn(),
    }));

    require('../main');

    const vueInstance = Vue.mock.calls[0][0];
    vueInstance.render(mockRender);

    expect(mockRender).toHaveBeenCalledWith(App);
  });
});
