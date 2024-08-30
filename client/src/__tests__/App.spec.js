// src/__tests__/App.spec.js


import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';
import ApiTester from '@/components/ApiTester.vue';

describe('App.vue', () => {
  it('renders without crashing', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.exists()).toBe(true);
  });

  it('contains a main element', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.find('main').exists()).toBe(true);
  });

  it('displays the correct footer text', () => {
    const wrapper = shallowMount(App);
    const currentYear = new Date().getFullYear();
    expect(wrapper.find('footer p').text()).toContain(
      `© ${currentYear} Full Stack Connection Kit created by Abe Reyes`
    );
  });

  it('includes the ApiTester component', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.findComponent(ApiTester).exists()).toBe(true);
  });

  it('computes the current year correctly', () => {
    const wrapper = shallowMount(App);
    const vm = wrapper.vm;
    expect(vm.currentYear).toBe(new Date().getFullYear());
  });
});