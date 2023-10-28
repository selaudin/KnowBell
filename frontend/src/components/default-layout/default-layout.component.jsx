import {Navigate, Outlet, useNavigate} from "react-router-dom";
import {NavLink, TeamLogo} from "./default-layout.styles.jsx";
import {useDispatch, useSelector} from "react-redux";
import {logoutUser} from "../../store/user/user.action";
import {selectCurrentUser} from "../../store/user/user.selector";

export default function DefaultLayout() {
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    if (!user) {
        // TODO: Set notification
        console.log("Not authenticated");
        return <Navigate to={"/login"}/>;
    }

    const onLogout = (e) => {
        e.preventDefault();
        dispatch(logoutUser());
        navigate('/login')
    };

    return (
        <div id={"defaultLayout"}>
            <aside>
                <TeamLogo>KnowBell</TeamLogo>
                {/* TODO: Chat blocks (history)*/}
                {/*<NavLink to={"/dashboard"}>*/}
                {/*    Dashboard*/}
                {/*</NavLink>*/}
            </aside>
            <div className="content">
                <header>
                    <div>
                        <h2 id={"greeting"}>
                            Hi {user.name}
                        </h2>
                    </div>
                    <div>
                        <a href="#" onClick={onLogout} className={"btn-logout"}>
                            Log out
                        </a>
                    </div>
                </header>
                <main>
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}
