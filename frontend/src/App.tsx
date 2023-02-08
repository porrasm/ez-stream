import { useState } from 'react'
import './App.css'
import { Watch } from './Watch'

type View = "none" | "watch" | "stream"

// Use React Router for URL routing because its better but new version didnt work for some reason
function App() {
  const [view, setView] = useState<View>("none")

  const renderView = () => {
    switch (view) {
      case "watch":
        return <Watch />
      case "stream":
        return <Stream />
      default:
        return null
    }
  }

  return (
    <div className="App">
      <Watch />
      <h1>EZ Stream</h1>
      <div>
        <button onClick={() => setView("watch")}>Watch</button>
        <button onClick={() => setView("stream")}>Stream</button>
      </div>
      {renderView()}
    </div>
  );
}

const Stream = () => {
  return <div>
    Stream
  </div>
}

export default App
