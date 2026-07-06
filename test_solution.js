const processUserData = require('./path-to-your-script');

describe('processUserData', () => {
  it('should resolve with processed user data for valid userId', async () => {
    const mockUserId = 'user123';
    const mockUserData = { id: mockUserId, name: 'John Doe', age: '30', isAdmin: true };
    jest.spyOn(global, 'fetchUserDataFromDatabase').mockResolvedValue(mockUserData);

    const result = await processUserData(mockUserId);
    expect(result).toEqual({ ...mockUserData, age: 30, isAdmin: true });
    expect(fetchUserDataFromDatabase).toHaveBeenCalledWith(mockUserId);
  });

  it('should reject with error for invalid userId', async () => {
    const mockUserId = '';
    try {
      await processUserData(mockUserId);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Invalid user ID');
    }
  });

  it('should reject with error if user not found', async () => {
    const mockUserId = 'user123';
    jest.spyOn(global, 'fetchUserDataFromDatabase').mockResolvedValue(null);

    try {
      await processUserData(mockUserId);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe(`User not found: ${mockUserId}`);
    }
  });

  it('should reject with error if database fetch fails', async () => {
    const mockUserId = 'user123';
    jest.spyOn(global, 'fetchUserDataFromDatabase').mockRejectedValue(new Error('Database error'));

    try {
      await processUserData(mockUserId);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Database error');
    }
  });
});