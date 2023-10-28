import {Outlet} from "react-router-dom";

export function DefaultLayout() {
    return (
        <>
            <div>Header Here</div>
            <main>
                <Outlet/>
            </main>
        </>
    )
}