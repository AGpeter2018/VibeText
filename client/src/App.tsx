import LandingPage from './pages/landingPage';
import Dashboard from './pages/dashBoard';
import { Routes, Route} from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/app' element={<Dashboard />} />
    </Routes>
  )

  
}

export default App;
