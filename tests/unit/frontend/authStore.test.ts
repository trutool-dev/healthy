/**
 * Tests unitarios: authStore.ts
 * Verifica setAuth, clearAuth y loadStoredAuth con SecureStore mockeado.
 */

jest.mock('expo-secure-store');

let secureStoreMock: typeof import('../../mocks/secureStore.mock');

beforeEach(() => {
  jest.resetModules();
  secureStoreMock = require('../../mocks/secureStore.mock');
  secureStoreMock.__reset();
});

async function getStore() {
  const { useAuthStore } = await import('../../../frontend/src/stores/authStore');
  return useAuthStore;
}

const MOCK_USER = { id: 'u1', email: 'test@healthy.app', name: 'Test User' };
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.test.token';

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

describe('estado inicial', () => {
  test('user es null', async () => {
    const store = await getStore();
    expect(store.getState().user).toBeNull();
  });

  test('token es null', async () => {
    const store = await getStore();
    expect(store.getState().token).toBeNull();
  });

  test('isAuthenticated es false', async () => {
    const store = await getStore();
    expect(store.getState().isAuthenticated).toBe(false);
  });

  test('isLoading es true (esperando carga del store persistido)', async () => {
    const store = await getStore();
    expect(store.getState().isLoading).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setAuth
// ---------------------------------------------------------------------------

describe('setAuth', () => {
  test('guarda user y token en el estado', async () => {
    const store = await getStore();
    await store.getState().setAuth(MOCK_USER, MOCK_TOKEN);
    expect(store.getState().user).toEqual(MOCK_USER);
    expect(store.getState().token).toBe(MOCK_TOKEN);
  });

  test('pone isAuthenticated en true', async () => {
    const store = await getStore();
    await store.getState().setAuth(MOCK_USER, MOCK_TOKEN);
    expect(store.getState().isAuthenticated).toBe(true);
  });

  test('persiste el token en SecureStore', async () => {
    const store = await getStore();
    await store.getState().setAuth(MOCK_USER, MOCK_TOKEN);
    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith('auth_token', MOCK_TOKEN);
  });

  test('persiste el user serializado en SecureStore', async () => {
    const store = await getStore();
    await store.getState().setAuth(MOCK_USER, MOCK_TOKEN);
    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith(
      'auth_user',
      JSON.stringify(MOCK_USER),
    );
  });
});

// ---------------------------------------------------------------------------
// clearAuth
// ---------------------------------------------------------------------------

describe('clearAuth', () => {
  test('limpia user, token e isAuthenticated', async () => {
    const store = await getStore();
    await store.getState().setAuth(MOCK_USER, MOCK_TOKEN);
    await store.getState().clearAuth();

    expect(store.getState().user).toBeNull();
    expect(store.getState().token).toBeNull();
    expect(store.getState().isAuthenticated).toBe(false);
  });

  test('borra el token de SecureStore', async () => {
    const store = await getStore();
    await store.getState().clearAuth();
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith('auth_token');
  });

  test('borra el user de SecureStore', async () => {
    const store = await getStore();
    await store.getState().clearAuth();
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith('auth_user');
  });
});

// ---------------------------------------------------------------------------
// loadStoredAuth
// ---------------------------------------------------------------------------

describe('loadStoredAuth', () => {
  test('restaura la sesión si SecureStore tiene token y user', async () => {
    // Pre-cargamos el store mockeado
    secureStoreMock.getItemAsync
      .mockResolvedValueOnce(MOCK_TOKEN)
      .mockResolvedValueOnce(JSON.stringify(MOCK_USER));

    const store = await getStore();
    await store.getState().loadStoredAuth();

    expect(store.getState().isAuthenticated).toBe(true);
    expect(store.getState().token).toBe(MOCK_TOKEN);
    expect(store.getState().user).toEqual(MOCK_USER);
  });

  test('no autentica si el token no existe', async () => {
    secureStoreMock.getItemAsync
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const store = await getStore();
    await store.getState().loadStoredAuth();

    expect(store.getState().isAuthenticated).toBe(false);
  });

  test('pone isLoading en false tras la carga (independientemente del resultado)', async () => {
    secureStoreMock.getItemAsync
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const store = await getStore();
    await store.getState().loadStoredAuth();

    expect(store.getState().isLoading).toBe(false);
  });

  test('pone isLoading en false incluso si SecureStore lanza error', async () => {
    secureStoreMock.getItemAsync.mockRejectedValue(new Error('SecureStore error'));

    const store = await getStore();
    await store.getState().loadStoredAuth();

    expect(store.getState().isLoading).toBe(false);
    expect(store.getState().isAuthenticated).toBe(false);
  });

  test('limpia SecureStore si ocurre un error de parseo', async () => {
    secureStoreMock.getItemAsync
      .mockResolvedValueOnce(MOCK_TOKEN)
      .mockResolvedValueOnce('{json-roto'); // JSON inválido → catch

    const store = await getStore();
    await store.getState().loadStoredAuth();

    // Debe haber intentado borrar las claves corruptas
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith('auth_user');
  });
});
