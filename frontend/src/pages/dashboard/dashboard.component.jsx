import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../store/user/user.selector";
import {Navigate} from "react-router-dom";

export function Dashboard() {

    const currentUser = useSelector(selectCurrentUser)


    if (!currentUser) {
        return <Navigate to={'/login'}/>
    }

    return (
        <div style={{textAlign: 'center'}}>
            <div style={{marginTop: "1%"}}>
                <input
                    placeholder={"Search"}
                />
            </div>

            <h3>Response here ....</h3>
            <h3>Documents here....</h3>
        </div>
    )
}