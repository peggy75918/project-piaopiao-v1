import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import Tasklist from './pages/Tasklist'
import Progress from './pages/Progress'
import Cloud from './pages/Cloud'
import Suggestion from './pages/Suggestion'
import Notification from './pages/Notification'
import Personal from './pages/Personal'
import './App.css'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tasklist' element={<Tasklist />} />
          <Route path='/progress' element={<Progress />} />
          <Route path='/cloud' element={<Cloud />} />
          <Route path='/suggestion' element={<Suggestion />} />
          <Route path='/notification' element={<Notification />} />
          <Route path='/personal' element={<Personal />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
