import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../store/user/user.selector";
import {Navigate} from "react-router-dom";
import {useRef, useState, useEffect} from "react";
import keyboardImage from '../../assets/keyboard.png'
import WriteLikeChatGPT from 'write-like-chat-gpt';
import { useParams } from 'react-router-dom';


export function Dashboard() {
    const currentUser = useSelector(selectCurrentUser)
    const searchRef = useRef(null)
    const [docs, setDocs] = useState(null)
    const [filteredDocs, setFilteredDocs] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const {id} = useParams();
    
    console.log("id", id);
    console.log("filteredDocs", filteredDocs);

    useEffect(() => {
        fetch('/conversations.json')
          .then((response) => response.json())
          .then((data) => {
            setDocs(data);
      
            if (id) {
              const filtered = data.filter((item) => item.historyID === parseInt(id));
              console.log('filtered', filtered);
              setFilteredDocs(filtered);
            }
          })
          .catch((error) => console.error('Error fetching data:', error));
      }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Requesting for keyword...', searchRef.current.value)

        // fetch('https://jsonplaceholder.typicode.com/posts/1/comments')
        fetch('/conversations.json')
            .then(response => response.json())
            .then(data => setDocs(data))
            .catch(error => console.error('Error fetching data:', error));
        
            
            

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
            {id ? (
                <div className={'docs-container'}
                     style={{marginTop: '10px', padding: '20px', height: '100vh', overflowY: 'auto'}}>
                    {
                    filteredDocs.map((doc, index) => {
                        console.log(doc);
                        return (
                        <div>
                            {doc.conversations.map((conv) => (
                                <div className="doc" key={index}>
                                     <div>Q: {conv.request}</div>
                                     <div>A: {conv.prompt}</div>
                                     {/* <WriteLikeChatGPT text={`A: ${conv.prompt}`} /> */}
                                   {/* <WriteLikeChatGPT text={` A: ${conv.prompt}`}/> */}
                                </div>
                            ))}
                            {/* <WriteLikeChatGPT text={doc.conversations[0].prompt} /> */}
                        </div>
                        );
                    })
                    }
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

