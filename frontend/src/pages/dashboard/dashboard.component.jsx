import {useSelector} from "react-redux";
import {selectCurrentUser} from "../../store/user/user.selector";
import {Navigate} from "react-router-dom";
import {useRef, useState, useEffect} from "react";
import keyboardImage from '../../assets/keyboard.png'
import WriteLikeChatGPT from 'write-like-chat-gpt';
import {useParams} from 'react-router-dom';


export function Dashboard() {
    const currentUser = useSelector(selectCurrentUser)
    const searchRef = useRef(null)
    const [blocks, setBlocks] = []
    const [docs, setDocs] = useState(null)
    const [filteredDocs, setFilteredDocs] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const {id} = useParams();
    const [request, setRequest] = useState('')
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(true)

    console.log("id", id);
    console.log("filteredDocs", filteredDocs);

    // useEffect(() => {
    //     console.log(id)
    //     if (id) {
    //         fetch(`http://localhost:8000/conversation?historyID=${id}`)
    //             .then((response) => response.json())
    //             .then((data) => {
    //                 setDocs(data);
    //                 console.log(data)
    //
    //                 if (id) {
    //                     const filtered = data.filter((item) => item.historyID === parseInt(id));
    //                     console.log('filtered', filtered);
    //                     setFilteredDocs(filtered);
    //                 }
    //
    //                 setLoading(false)
    //             })
    //             .catch((error) => console.error('Error fetching data:', error));
    //     } else {
    //         fetch(`http://localhost:8000/conversation`)
    //             .then((response) => response.json())
    //             .then((data) => {
    //                 setDocs(data);
    //
    //                 if (id) {
    //                     const filtered = data.filter((item) => item.historyID === parseInt(id));
    //                     console.log('filtered', filtered);
    //                     setFilteredDocs(filtered);
    //                 }
    //             })
    //             .catch((error) => console.error('Error fetching data:', error));
    //     }
    //
    //     setLoading(false)
    // }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault()

        console.log('requesting...')

        // Data to be sent in the POST request as an object
        const postData = [{
            question: searchRef.current.value,
            // Add more key-value pairs as needed
        }];

// Make a POST request with JSON data using the Fetch API
        fetch('http://localhost:8000/search?userID=4', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON
            },
            body: JSON.stringify(postData) // Convert the object to a JSON string
        })
            .then(res => res.json())
            .then(data => {
                console.log(data); // Handle the data from the server
                setFilteredDocs(data.docs)
                setDocs(data.docs)
                setPrompt(data.prompt)
                console.log(data.prompt)
                setRequest(data.request)

                setLoading(false)

            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });


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
                <input type="submit" hidden/>
            </form>
            {!loading ? (
                    <div className={'docs-container'}
                         style={{marginTop: '10px', padding: '20px 10%', height: '100vh', overflowY: 'auto'}}>
                        <div className="doc">
                            {/*<WriteLikeChatGPT text={`Q: ${request}`} style={{marginBottom: '20px'}}/>*/}
                            <div style={{fontWeight: 'bold'}}>Q: {request}</div>
                            <WriteLikeChatGPT text={`A: ${prompt}`}/>
                        </div>
                        <div>
                            Links: <br/>
                            {docs.map(url => (
                                <a href={`https://bfgtest.service-now.com${url}`}><WriteLikeChatGPT
                                    text={`${url}`}/></a>
                            ))}
                        </div>
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

