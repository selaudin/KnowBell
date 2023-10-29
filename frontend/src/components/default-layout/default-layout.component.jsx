import {Navigate, Outlet, useNavigate} from "react-router-dom";
import {NavLink, TeamLogo} from "./default-layout.styles.jsx";
import {useDispatch, useSelector} from "react-redux";
import {logoutUser} from "../../store/user/user.action";
import {selectCurrentUser} from "../../store/user/user.selector";
import {AiOutlinePlus} from 'react-icons/ai'
import {useEffect, useState} from "react";

export default function DefaultLayout() {
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [chats, setChats] = useState([])

    // useEffect(() => {
    //     console.log('settings chats')
    //     fetch('https://jsonplaceholder.typicode.com/albums')
    //         .then(res => res.json())
    //         .then(data => setChats(data))
    // }, []);

    useEffect(() => {
        console.log('settings chats')
        fetch('/history.json') 
            .then(response => response.json())
            .then(data => setChats(data))
            .catch(error => console.error('Error fetching data:', error));
        }, []);


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
        <div id={"defaultLayout"} style={{ display: 'flex' }}>
            <aside style={{ flex: '0 0 280px', height: '100vh', overflowY: 'auto', padding: '5px'}}>
                <TeamLogo>KnowBell</TeamLogo>
                {/*TODO: Chat blocks (history)*/}
                <NavLink to={`/chat`}
                style={{border: '1px solid white', borderRadius: '10px'}}
                >
                    <AiOutlinePlus style={{fontSize: '20px', marginRight: '20px'}}/> New Chat
                </NavLink>
                {
                    chats.map(chat => (
                        <NavLink key={chat.id} to={`/chat`}>
                            {chat.title.charAt(0).toUpperCase() + chat.title.slice(1)}
                        </NavLink>
                    ))
                }
            </aside>
            <div className="content" style={{ flex: '1', position: 'sticky', overflowY: 'auto', maxHeight: '100vh' }}>
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
