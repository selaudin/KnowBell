import {Navigate, Outlet} from "react-router-dom";

export default function GuestLayout() {
// TODO: Check for token
//     if (token) {
//         return <Navigate to={'/users'}/>
//     }
    return (
        <>
            <Outlet/>
        </>
    )
}