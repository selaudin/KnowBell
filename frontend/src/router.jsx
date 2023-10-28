import {createBrowserRouter, Navigate} from "react-router-dom";
import GuestLayout from "./components//guest-layout/guest-layout.components";
import App from "./App";
import NotFound from "./pages/not-found/not-found.component";
import Login from "./pages/login/login.component";
import Signup from "./pages/signup/signup.component";


const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                path: "/",
                // Can also be rendered directly, this is navigated...
                element: <Navigate to={"/dashboard"}/>,
            }
        ]
    },
    {
        path: "/",
        element: <GuestLayout/>,
        children: [
            {
                path: "/login",
                element: <Login/>,
            },
            {
                path: "/signup",
                element: <Signup/>,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound/>,
    },
]);

export default router;