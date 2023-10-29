import {createBrowserRouter, Navigate} from "react-router-dom";
import GuestLayout from "./components//guest-layout/guest-layout.components";
import NotFound from "./pages/not-found/not-found.component";
import Login from "./pages/login/login.component";
import Signup from "./pages/signup/signup.component";
import DefaultLayout from "./components/default-layout/default-layout.component";
import {Dashboard} from "./pages/dashboard/dashboard.component";


const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout/>,
        children: [
            {
                path: "/",
                // Can also be rendered directly, this is navigated...
                element: <Navigate to={"/dashboard"}/>,
            },
            {
                path: "/dashboard",
                element: <Dashboard/>,
            },
            {
                path: "/dashboard/:id",
                element: <Dashboard/>,
            },
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
