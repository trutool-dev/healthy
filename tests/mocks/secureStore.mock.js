/**
 * Mock de expo-secure-store para tests de Node.js.
 * Simula el almacenamiento seguro con un Map en memoria.
 */
const store = new Map();

const setItemAsync    = jest.fn(async (key, value) => { store.set(key, value); });
const getItemAsync    = jest.fn(async (key)         => store.get(key) ?? null);
const deleteItemAsync = jest.fn(async (key)         => { store.delete(key); });

/** Limpia el store en memoria (útil en beforeEach) */
const __reset = () => {
  store.clear();
  setItemAsync.mockClear();
  getItemAsync.mockClear();
  deleteItemAsync.mockClear();
};

module.exports = { setItemAsync, getItemAsync, deleteItemAsync, __reset };
