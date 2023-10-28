import {createSelector} from "reselect"

const selectUserReducer = state => state.user

export const selectCurrentUser = createSelector(
    [selectUserReducer],
    (user) => user.user
)
export const selectToken = createSelector(
    [selectUserReducer],
    (user) => user.token
)