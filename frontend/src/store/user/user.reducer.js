import {USER_ACTION_TYPES} from "./user.types";

// reducers.js
export const initialState = {
    user: null,
};

export const userReducer = (state = initialState, action = {}) => {
    switch (action.type) {
        case USER_ACTION_TYPES.LOGIN_USER:
            return {
                ...state,
                user: action.payload.user,
            };
        case USER_ACTION_TYPES.LOGOUT_USER:
            return {
                ...state,
                user: null,
            };
        default:
            return state;
    }
};
