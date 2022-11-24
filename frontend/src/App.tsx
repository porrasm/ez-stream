import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { Setup } from './Setup'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/watch' element={<Setup />}>
            <Setup />
          </Route>
          <Route path='/upload'>
            <span>Upload</span>
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App
