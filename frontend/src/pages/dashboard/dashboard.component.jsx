import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../store/user/user.selector";
import {Navigate} from "react-router-dom";
import {useRef, useState} from "react";
import keyboardImage from '../../assets/keyboard.png'
import WriteLikeChatGPT from 'write-like-chat-gpt'

export function Dashboard() {
    const currentUser = useSelector(selectCurrentUser)
    const searchRef = useRef(null)
    const [docs, setDocs] = useState([])

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Requesting for keyword...', searchRef.current.value)

        fetch('https://jsonplaceholder.typicode.com/posts')
            .then(res => res.json())
            .then(data => setDocs(data))
    }


    if (!currentUser) {
        return <Navigate to={'/login'}/>
    }

    return (
        <div style={{textAlign: 'center', position: 'sticky', top: '0', zIndex: '1'}}>
            <form onSubmit={handleSubmit} style={{position: 'sticky'}}>
                <input ref={searchRef} placeholder={"Search"} id="search-bar"/>
            </form>
            {!searchRef.current?.value && (
                <>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(50vh)',
                    color: 'grey'
                }}>
                    <img src={keyboardImage} alt={'keyboard'} height={70} width={'auto'} color={'grey'}
                    style={{margin: '20px'}}/>
                    <h2>Start searching and find the data you are looking for...</h2>
                </div>
                </>
            )}
            {searchRef.current?.value && (
                <div className={'docs-container'}
                     style={{marginTop: '10px', padding: '20px', height: '100vh', overflowY: 'auto'}}>
                    {docs.map(doc => (<div className="doc" key={doc.id}><WriteLikeChatGPT text={doc.title} /></div>))}
                </div>
            )}
        </div>

    )
}

