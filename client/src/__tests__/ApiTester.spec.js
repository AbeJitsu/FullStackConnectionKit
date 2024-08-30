import { shallowMount } from '@vue/test-utils';
import ApiTester from '@/components/ApiTester.vue';

describe('ApiTester.vue', () => {
  it('renders without crashing', () => {
    const wrapper = shallowMount(ApiTester);
    expect(wrapper.exists()).toBe(true);
  });

  // Add more specific tests based on the ApiTester component's functionality
  // For example:
  // it('has an input field for API endpoint', () => {
  //   const wrapper = shallowMount(ApiTester)
  //   expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  // })

  // it('has a button to send API request', () => {
  //   const wrapper = shallowMount(ApiTester)
  //   expect(wrapper.find('button').text()).toBe('Send Request')
  // })
});
