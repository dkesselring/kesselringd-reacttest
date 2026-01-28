import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [inputHistory, setInputHistory] = useState([]);
  const outputBoxRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add to local history
      setInputHistory([...inputHistory, inputValue]);
      
      // Log to database
      try {
        const response = await fetch('http://localhost:3001/api/log-input', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: inputValue,
            userId: 'user-1', // You can make this dynamic later
          }),
        });
        
        if (response.ok) {
          console.log('Input logged to database successfully');
        } else {
          console.error('Failed to log input to database');
        }
      } catch (error) {
        console.error('Error logging to database:', error);
      }
      
      setInputValue('');
    }
  };

  useEffect(() => {
    if (outputBoxRef.current) {
      outputBoxRef.current.scrollTop = outputBoxRef.current.scrollHeight;
    }
  }, [inputHistory]);

  return (
    <div className="App">
      <div className="main-container">
        {/* Left 2/3 */}
        <header className="App-header">
          <img src="Octocat.png" className="App-logo" alt="logo" />
          <p>
            GitHub Codespaces <span className="heart">♥️</span> React
          </p>
          <p className="small">
            Edit <code>src/App.jsx</code> and save to reload.
          </p>
          
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              placeholder="Enter some text..."
              value={inputValue}
              onChange={handleInputChange}
              className="text-input"
            />
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
          
          <p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </p>
        </header>

        {/* Right 1/3 */}
        <div className="display-panel">
          <h2 className="display-title">Output</h2>
          <div className="output-box" ref={outputBoxRef}>
            {inputHistory.length === 0 ? (
              <p className="placeholder-text">Submit text to see output</p>
            ) : (
              inputHistory.map((item, index) => (
                <div key={index} className="output-item">
                  {item.toUpperCase()}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
