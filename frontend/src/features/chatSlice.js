import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../lib/axiosConfig";

// API endpoints
const CONVERSATION_ENDPOINT = "conversation";
const MESSAGE_ENDPOINT = "message";

const initialState = {
  status: "",
  error: "",
  conversations: [],
  activeConversation: {},
  messages: [],
  notifications: [],
  files: [],
};

//functions
export const getConversations = createAsyncThunk(
  "conervsation/all",
  async (token, { rejectWithValue }) => {
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
  async (values, { rejectWithValue }) => {
    const { token, receiver_id, isGroup, convo_id } = values;
    try {
      const { data } = await api.post(CONVERSATION_ENDPOINT, {
        receiver_id,
        isGroup,
        convo_id,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);
export const getConversationMessages = createAsyncThunk(
  "conervsation/messages",
  async (values, { rejectWithValue }) => {
    const { token, convo_id } = values;
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
  async (values, { rejectWithValue }) => {
    const { token, message, convo_id, files } = values;
    try {
      const { data } = await api.post(MESSAGE_ENDPOINT, {
        message,
        convo_id,
        files,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message);
    }
  }
);
export const createGroupConversation = createAsyncThunk(
  "conervsation/create_group",
  async (values, { rejectWithValue }) => {
    const { token, name, users } = values;
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
    const { token, messageId, convo_id } = values;
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
    const { token, messageId } = values;
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
      //update messages
      let convo = state.activeConversation;
      if (convo._id === action.payload.conversation._id) {
        state.messages = [...state.messages, action.payload];
      }
      //update conversations
      let conversation = {
        ...action.payload.conversation,
        latestMessage: action.payload,
      };
      let newConvos = [...state.conversations].filter(
        (c) => c._id !== conversation._id
      );
      newConvos.unshift(conversation);
      state.conversations = newConvos;
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
  },
  extraReducers(builder) {
    builder
      .addCase(getConversations.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.conversations = action.payload;
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
        state.activeConversation = action.payload;
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
        state.status = "succeeded";
        state.messages = [...state.messages, action.payload];
        let conversation = {
          ...action.payload.conversation,
          latestMessage: action.payload,
        };
        let newConvos = [...state.conversations].filter(
          (c) => c._id !== conversation._id
        );
        newConvos.unshift(conversation);
        state.conversations = newConvos;
        state.files = [];
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
} = chatSlice.actions;

export default chatSlice.reducer;
