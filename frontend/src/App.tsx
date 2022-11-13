import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import { Setup } from './Setup'

function App() {
  return (
    <div className="App">
      <Router>
        <Setup />
      </Router>
    </div>
  )
}

export default App
