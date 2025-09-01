let store;

export const initializeStore = (storeInstance) => {
  store = storeInstance;
};

export const getStore = () => {
  if (!store) {
    throw new Error("Store has not been initialized");
  }
  return store;
};

export const dispatch = (action) => {
  if (!store) {
    throw new Error("Store has not been initialized");
  }
  return store.dispatch(action);
};

export const getState = () => {
  if (!store) {
    throw new Error("Store has not been initialized");
  }
  return store.getState();
};

export const getToken = () => {
  if (!store) {
    console.warn("Store not initialized yet");
    return null;
  }
  const token = store.getState()?.user?.user?.token;
  if (!token) {
    console.warn("No token found in store. User might need to log in.");
  }
  return token;
};
