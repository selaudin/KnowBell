import {Link, useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loginUser} from "../../store/user/user.action.js";
import {selectCurrentUser} from "../../store/user/user.selector.js";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);

    const emailRef = useRef();
    const passwordRef = useRef();

    useEffect(() => {
        if (currentUser) {
            navigate("/dashboard");
        }
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
            // TODO: Change to dynamic
            name: 'KnowBell'
        };

        console.log(process.env.REACT_APP_EMAIL)
        console.log(process.env.REACT_APP_PASS)

        if (emailRef.current.value === process.env.REACT_APP_EMAIL
            && passwordRef.current.value === process.env.REACT_APP_PASS
        ) {
            dispatch(loginUser(payload));
            navigate('/dashboard')
        } else {
            alert('Auth failed!')
            console.log('Authentication failed')
        }
    };

    return (
        <div className="login-form animated fadeInDown">
            <div className="form">
                <form onSubmit={onSubmit}>
                    <h1 className={"title"}>Login into your account</h1>
                    <input ref={emailRef} type="email" placeholder={"Email"}/>
                    <input ref={passwordRef} type="password" placeholder={"Password"}/>
                    <button className="btn btn-block" type={"submit"}>
                        Log in
                    </button>
                </form>
            </div>
        </div>
    );
}
