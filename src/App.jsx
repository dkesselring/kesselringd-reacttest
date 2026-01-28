import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [inputHistory, setInputHistory] = useState([]);
  const [dbLogs, setDbLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const outputBoxRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('http://localhost:3001/api/logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched logs:', data);
        setDbLogs(data.events || []);
      } else {
        console.error('Failed to fetch logs, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
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
          // Refresh the logs table
          fetchLogs();
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

  useEffect(() => {
    // Fetch logs on component mount
    fetchLogs();
  }, []);

  return (
    <div className="App">
      <div className="main-container">
        {/* Top 2/3 - Left and Right panels */}
        <div className="top-section">
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

        {/* Bottom 1/3 - Database Table */}
        <div className="db-panel">
          <div className="db-panel-header">
            <h2 className="db-title">Database Logs</h2>
            <button onClick={fetchLogs} className="refresh-button" disabled={loadingLogs}>
              {loadingLogs ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="table-container">
            {dbLogs.length === 0 ? (
              <p className="placeholder-text">No logs yet</p>
            ) : (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Event Type</th>
                    <th>User ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {dbLogs.map((log, index) => {
                    const eventData = log.event_data || {};
                    let details = '';
                    
                    if (eventData.input) {
                      details = `Input: "${eventData.input}"`;
                    } else if (eventData.action) {
                      details = `Action: ${eventData.action}`;
                    } else if (eventData.message) {
                      details = `Message: ${eventData.message}`;
                    } else {
                      details = JSON.stringify(eventData).substring(0, 100);
                    }
                    
                    return (
                      <tr key={index}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>{log.event_type}</td>
                        <td>{eventData.userId || '-'}</td>
                        <td className="input-cell">{details}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
