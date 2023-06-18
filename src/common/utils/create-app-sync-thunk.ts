import {createAsyncThunk} from "@reduxjs/toolkit";
import {AppDispatch, AppRootStateType} from "../../app/store";

export const createAppSyncThunk = createAsyncThunk.withTypes<{
    state: AppRootStateType,
    dispatch: AppDispatch,
    rejectValue: null
}>()