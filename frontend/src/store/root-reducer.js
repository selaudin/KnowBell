import {combineReducers} from "redux";
import {userReducer} from "./user/user.reducer.js";


export const rootReducer = combineReducers({
    user: userReducer,
})