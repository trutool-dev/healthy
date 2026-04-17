/**
 * Mock mínimo de react-native para tests de stores.
 * Solo expone lo que los stores realmente usan.
 */
module.exports = {
  Platform: { OS: 'ios', select: (obj) => obj.ios ?? obj.default },
};
