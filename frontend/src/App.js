import './App.css';

function App() {
  return (
    <div className="App">
      {process.env.REACT_APP_BACKEND_URL}
    </div>
  );
}

export default App;
