import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createFilter from "redux-persist-transform-filter";
import storage from "redux-persist/lib/storage";
import { initializeStore } from "../lib/storeAccess";
import chatSlice from "../features/chatSlice";

// Create a lazy loaded reducer for userSlice
const lazyLoadedReducers = {
  chat: chatSlice,
  user: (
    state = {
      status: "",
      error: "",
      user: {
        id: "",
        name: "",
        email: "",
        picture: "",
        status: "",
        token: "",
      },
    },
    action
  ) => state,
};

//saveUserOnlyFilter
const saveUserOnlyFilter = createFilter("user", ["user"]);

//persist config
const persistConfig = {
  key: "user",
  storage,
  whitelist: ["user"],
  transforms: [saveUserOnlyFilter],
};

const rootReducer = combineReducers(lazyLoadedReducers);
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Lazy load and inject the user reducer after store creation
const injectUserReducer = async (store) => {
  const userSlice = (await import("../features/userSlice")).default;
  store.replaceReducer(
    persistReducer(
      persistConfig,
      combineReducers({
        ...lazyLoadedReducers,
        user: userSlice,
      })
    )
  );
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true,
});

// Initialize store access right after store creation
initializeStore(store);

// Inject the user reducer after store creation
injectUserReducer(store).catch(console.error);

export const persistor = persistStore(store);
