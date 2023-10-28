import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../store/user/user.selector";
import {Navigate} from "react-router-dom";
import {useRef, useState, useEffect} from "react";
import keyboardImage from '../../assets/keyboard.png'
import WriteLikeChatGPT from 'write-like-chat-gpt'

export function Dashboard() {
    const currentUser = useSelector(selectCurrentUser)
    const searchRef = useRef(null)
    const [docs, setDocs] = useState(null)
    const [inputValue, setInputValue] = useState('');

    // useEffect(() => {
    //     fetch('/history.json') 
    //       .then(response => response.json())
    //       .then(data => setDocs(data))
    //       .catch(error => console.error('Error fetching data:', error));
    //   }, []);

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Requesting for keyword...', searchRef.current.value)

        fetch('https://jsonplaceholder.typicode.com/posts/1/comments')
        // fetch('/history.json')
            .then(res => res.json())
            .then(data => setDocs(data))


         // Clear the input field by resetting its value to an empty string
        searchRef.current.value = '';
        console.log('ref', searchRef);
    }

    if (!currentUser) {
        return <Navigate to={'/login'}/>
    }

    return (
        <div style={{textAlign: 'center', position: 'sticky', top: '0', zIndex: '1'}}>
            <form onSubmit={handleSubmit} style={{position: 'sticky'}}>
                <input ref={searchRef} placeholder={"Search"} id="search-bar"/>
            </form>
            {docs ? (
                <div className={'docs-container'}
                     style={{marginTop: '10px', padding: '20px', height: '100vh', overflowY: 'auto'}}>
                    {docs.map(doc => (<div className="doc" key={doc.id}><WriteLikeChatGPT text={doc.body} /></div>))}
                </div>
            ) : 
            <>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(50vh)',
                color: 'grey'
            }}>
                <img src={keyboardImage} alt={'keyboard'} height={80} width={'auto'} color={'grey'}
                style={{margin: '20px', opacity: '0.7'}}/>
                <h2>Start searching and find the data you are looking for...</h2>
            </div>
            </>
        }
        </div>

    )
}

