import { configureStore } from "@reduxjs/toolkit";
import marketReducer from "./slices/marketSlice";
import wsReducer from "./slices/wsSlice";

export const store = configureStore({
	reducer: {
		market: marketReducer,
		ws: wsReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

