import { shallowMount } from '@vue/test-utils';
import ItemManager from '@/components/ItemManager.vue';
import { apiCall } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiCall: jest.fn(),
}));

describe('ItemManager.vue', () => {
  let wrapper;
  const mockApiUrl = 'http://test-api.com';

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(ItemManager, {
      propsData: { apiUrl: mockApiUrl },
    });
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('computes total quantity correctly', () => {
    wrapper.setData({
      items: [{ quantity: 2 }, { quantity: 3 }, { quantity: 1 }],
    });
    expect(wrapper.vm.totalQuantity).toBe(6);
  });

  it('validates form correctly', async () => {
    expect(wrapper.vm.isFormValid).toBe(false);

    await wrapper.setData({
      newItem: { name: 'Test Item', quantity: 1, price: 10 },
    });

    expect(wrapper.vm.isFormValid).toBe(true);
  });

  it('creates an item successfully', async () => {
    apiCall.mockResolvedValueOnce({ success: true });
    apiCall.mockResolvedValueOnce([]); // Mocking the fetchItems response

    await wrapper.setData({
      newItem: { name: 'Test Item', quantity: 1, price: 10 },
    });

    await wrapper.vm.createItem();

    expect(apiCall).toHaveBeenCalledWith('post', `${mockApiUrl}/api/items`, {
      name: 'Test Item',
      description: '',
      quantity: 1,
      price: 10,
    });
    expect(apiCall).toHaveBeenCalledWith('get', `${mockApiUrl}/api/items`);
    expect(wrapper.vm.newItem).toEqual({
      name: '',
      description: '',
      quantity: 0,
      price: 0,
    });
  });

  it('fetches items successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    apiCall.mockResolvedValue(mockItems);

    await wrapper.vm.fetchItems();

    expect(apiCall).toHaveBeenCalledWith('get', `${mockApiUrl}/api/items`);
    expect(wrapper.vm.items).toEqual(mockItems);
  });

  it('deletes an item successfully', async () => {
    const itemId = '123';
    apiCall.mockResolvedValueOnce({ success: true });
    apiCall.mockResolvedValueOnce([]); // Mocking the fetchItems response

    await wrapper.vm.deleteItem(itemId);

    expect(apiCall).toHaveBeenCalledWith(
      'delete',
      `${mockApiUrl}/api/items/${itemId}`
    );
    expect(apiCall).toHaveBeenCalledWith('get', `${mockApiUrl}/api/items`);
  });
});
