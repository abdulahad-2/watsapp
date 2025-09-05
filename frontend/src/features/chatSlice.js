import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../lib/axiosConfig";

// API endpoints
const CONVERSATION_ENDPOINT = "conversation";
const MESSAGE_ENDPOINT = "message";

// Load conversations/messages from localStorage
const loadConversations = () => {
  try {
    return JSON.parse(localStorage.getItem('conversations')) || [];
  } catch (_) {
    return [];
  }
};

const initialState = {
  status: "",
  error: "",
  conversations: loadConversations(),
  activeConversation: {},
  messages: [],
  notifications: [],
  files: [],
};

//functions
export const getConversations = createAsyncThunk(
  "conervsation/all",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(CONVERSATION_ENDPOINT);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);
export const open_create_conversation = createAsyncThunk(
  "conervsation/open_create",
  async (values, { getState, rejectWithValue }) => {
    const { receiver_id, isGroup } = values;
    try {
      // Build a stable direct-message conversation id for two users
      const state = getState();
      const me = state?.user?.user || {};
      const myId = me?.id || me?._id;
      const otherId = receiver_id;
      const stableConvoId = !isGroup && myId && otherId
        ? (String(myId) < String(otherId)
            ? `dm_${String(myId)}_${String(otherId)}`
            : `dm_${String(otherId)}_${String(myId)}`)
        : values.convo_id;

      const { data } = await api.post(CONVERSATION_ENDPOINT, {
        receiver_id,
        isGroup,
        convo_id: stableConvoId,
      });
      // Ensure users array is present so UI can render names/pictures
      const receiver = values?.receiver || null;
      if (!data.users || data.users.length === 0) {
        const meUser = {
          _id: me._id || me.id,
          id: me.id || me._id,
          name: me.name,
          email: me.email,
          picture: me.picture,
          status: me.status,
        };
        const otherUser = receiver
          ? {
              _id: receiver._id || receiver.id,
              id: receiver.id || receiver._id,
              name: receiver.name,
              email: receiver.email,
              picture: receiver.picture,
              status: receiver.status,
            }
          : { _id: receiver_id, id: receiver_id };
        data.users = [meUser, otherUser];
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);
export const getConversationMessages = createAsyncThunk(
  "conervsation/messages",
  async (values, { rejectWithValue }) => {
    const { convo_id } = values;
    try {
      const { data } = await api.get(`${MESSAGE_ENDPOINT}/${convo_id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);
export const sendMessage = createAsyncThunk(
  "message/send",
  async (values, { getState, rejectWithValue }) => {
    const { message, convo_id, files } = values;
    try {
      const state = getState();
      const me = state?.user?.user || {};
      const myId = me?.id || me?._id;
      const active = state?.chat?.activeConversation || {};
      const users = Array.isArray(active?.users) ? active.users : [];
      // Compute stable DM id if possible
      let finalConvoId = convo_id;
      if (!active?.isGroup && users.length && myId && typeof convo_id === 'string' && !convo_id.startsWith('dm_')) {
        const ids = users.map(u => u?._id || u?.id).filter(Boolean);
        const otherId = ids.find(id => String(id) !== String(myId));
        if (otherId) {
          finalConvoId = String(myId) < String(otherId)
            ? `dm_${String(myId)}_${String(otherId)}`
            : `dm_${String(otherId)}_${String(myId)}`;
        }
      }
      const { data } = await api.post(MESSAGE_ENDPOINT, {
        message,
        convo_id: finalConvoId,
        files,
        users,
        sender: { _id: myId },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);
export const createGroupConversation = createAsyncThunk(
  "conervsation/create_group",
  async (values, { rejectWithValue }) => {
    const { name, users } = values;
    try {
      const { data } = await api.post(`${CONVERSATION_ENDPOINT}/group`, {
        name,
        users,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "message/delete",
  async (values, { rejectWithValue }) => {
    const { messageId, convo_id } = values;
    try {
      await api.delete(`${MESSAGE_ENDPOINT}/${messageId}`, {
        data: { convo_id },
      });
      return { messageId, convo_id };
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);

export const starMessage = createAsyncThunk(
  "message/star",
  async (values, { rejectWithValue }) => {
    const { messageId } = values;
    try {
      const { data } = await api.patch(
        `${MESSAGE_ENDPOINT}/${messageId}/star`,
        {}
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);
export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    updateMessagesAndConversations: (state, action) => {
      // Dedupe by _id to avoid duplicates when sender receives own socket event
      const incoming = action.payload;
      const exists = state.messages.some((m) => m._id === incoming._id);
      let convo = state.activeConversation;
      if (convo._id === incoming.conversation._id && !exists) {
        state.messages = [...state.messages, incoming];
      }
      //update conversations
      const existing = state.conversations.find(c => c._id === incoming.conversation._id);
      let conversation = {
        ...existing,
        ...incoming.conversation,
        users: (existing && existing.users && existing.users.length) ? existing.users : (state.activeConversation._id === incoming.conversation._id ? state.activeConversation.users : incoming.conversation.users),
        latestMessage: incoming,
      };
      let newConvos = [...state.conversations].filter(
        (c) => c._id !== conversation._id
      );
      newConvos.unshift(conversation);
      state.conversations = newConvos;
      try { localStorage.setItem('conversations', JSON.stringify(state.conversations)); } catch (_) {}
    },
    addFiles: (state, action) => {
      state.files = [...state.files, action.payload];
    },
    clearFiles: (state, action) => {
      state.files = [];
    },
    removeFileFromFiles: (state, action) => {
      let index = action.payload;
      let files = [...state.files];
      let fileToRemove = [files[index]];
      state.files = files.filter((file) => !fileToRemove.includes(file));
    },
    removeMessage: (state, action) => {
      const { messageId, convo_id } = action.payload;
      state.messages = state.messages.filter((msg) => msg._id !== messageId);

      // Update conversation's latest message if needed
      let conversation = state.conversations.find((c) => c._id === convo_id);
      if (conversation && conversation.latestMessage?._id === messageId) {
        const remainingMessages = state.messages.filter(
          (msg) => msg.conversation._id === convo_id
        );
        conversation.latestMessage =
          remainingMessages[remainingMessages.length - 1] || null;
      }
    },
    // Patch users array for a conversation when we fetch missing user info
    patchConversationUsers: (state, action) => {
      const { convo_id, users } = action.payload || {};
      if (!convo_id || !Array.isArray(users)) return;
      // Update activeConversation
      if (state.activeConversation && state.activeConversation._id === convo_id) {
        state.activeConversation = { ...state.activeConversation, users };
      }
      // Update list
      state.conversations = state.conversations.map((c) =>
        c._id === convo_id ? { ...c, users } : c
      );
      try { localStorage.setItem('conversations', JSON.stringify(state.conversations)); } catch (_) {}
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getConversations.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        const incoming = Array.isArray(action.payload) ? action.payload : [];
        // Prefer local persisted if available and non-empty
        state.conversations = loadConversations().length ? loadConversations() : incoming;
        try { localStorage.setItem('conversations', JSON.stringify(state.conversations)); } catch (_) {}
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(open_create_conversation.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(open_create_conversation.fulfilled, (state, action) => {
        state.status = "succeeded";
        const convo = action.payload?.conversation || action.payload;
        state.activeConversation = convo || {};
        if (convo && convo._id) {
          const exists = state.conversations.find((c) => c._id === convo._id);
          if (!exists) {
            state.conversations = [convo, ...state.conversations];
          } else {
            state.conversations = [convo, ...state.conversations.filter(c => c._id !== convo._id)];
          }
          try { localStorage.setItem('conversations', JSON.stringify(state.conversations)); } catch (_) {}
        }
        state.files = [];
      })
      .addCase(open_create_conversation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(getConversationMessages.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getConversationMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload;
      })
      .addCase(getConversationMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Do NOT append to messages here to avoid duplicates.
        // The socket 'receive message' handler will append for both sender and receiver.
        state.status = "succeeded";
        const payload = action.payload;
        const existing = state.conversations.find(c => c._id === payload.conversation._id) || {};
        let conversation = {
          ...existing,
          ...payload.conversation,
          users: (existing.users && existing.users.length)
            ? existing.users
            : (state.activeConversation._id === payload.conversation._id ? state.activeConversation.users : payload.conversation.users),
          latestMessage: payload,
        };
        let newConvos = [...state.conversations].filter(
          (c) => c._id !== conversation._id
        );
        newConvos.unshift(conversation);
        state.conversations = newConvos;
        state.files = [];
        try { localStorage.setItem('conversations', JSON.stringify(state.conversations)); } catch (_) {}
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteMessage.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { messageId } = action.payload;
        state.messages = state.messages.filter((msg) => msg._id !== messageId);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(starMessage.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(starMessage.fulfilled, (state, action) => {
        const { convo_id, messageId, isStarred } = action.payload;
        const conversation = state.conversations.find(
          (c) => c._id === convo_id
        );
        if (conversation) {
          const message = conversation.messages.find(
            (m) => m._id === messageId
          );
          if (message) {
            message.starred = isStarred;
          }
        }
      })
      .addCase(starMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});
export const {
  setActiveConversation,
  updateMessagesAndConversations,
  addFiles,
  clearFiles,
  removeFileFromFiles,
  removeMessage,
  patchConversationUsers,
} = chatSlice.actions;

export default chatSlice.reducer;
