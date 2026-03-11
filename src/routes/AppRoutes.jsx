import { Route, Routes } from 'react-router-dom'
import Login from '../pages/login/Login'
import Users from '../pages/contents/Users'
import Team from '../pages/contents/Team'
import SDLC from '../pages/contents/SDLC'
import Charging from '../pages/contents/Charging'

import DataTable from '../component/reuseable/DataTable'
import Confirmation from '../component/reuseable/Confirmation'
import UserArchive from '../pages/dialog/archivedialog/UserArchive'
import Role from '../pages/contents/Role'
import Dashboard from '../pages/contents/Dashboard'
import TopNavContent from '../component/TopNavContent'
import Systems from '../pages/contents/Systems'
import SystemCategory from '../pages/contents/SystemCategory'
import Navbar from '../component/Navbar'
import Category from '../pages/contents/category'
import Sidebar from '../component/sidebar'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import LighthouseLoader from '../component/reuseable/Loading'
import Practice from '../pages/contents/Practice'

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES (Only for unauthenticated users) ===== */}
      {/* If user is already logged in, they get redirected to /Dashboard */}
      <Route path="/" element={<PublicRoute element={<Login />} redirectTo="/Dashboard" />} />
      <Route path="/login" element={<PublicRoute element={<Login />} redirectTo="/Dashboard" />} />

      {/* ===== PROTECTED ROUTES (Must be logged in) ==== */}
      {/* Main layout with Navbar - all routes here are protected */}
      <Route element={<ProtectedRoute element={<Navbar />} />}>
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} permission="Dashboard" />} />
        <Route path="/users" element={<ProtectedRoute element={<Users />} permission="Users" />} />
        <Route path="/users/archive" element={<ProtectedRoute element={<UserArchive />} permission="Users" />} />
        <Route path="/role" element={<ProtectedRoute element={<Role />} permission="Role" />} />
        <Route path="/team" element={<ProtectedRoute element={<Team />} permission="Team" />} />
        <Route path="/charging" element={<ProtectedRoute element={<Charging />} permission="Charging" />} />
        <Route path="/systems" element={<ProtectedRoute element={<Systems />} permission="Systems" />} />
        <Route path="/systemCategory/:systemName" element={<ProtectedRoute element={<SystemCategory />} permission="Systems" />} />
        <Route path="/category" element={<ProtectedRoute element={<Category />} permission="Category" />} />
      </Route>

      {/* Other protected routes */}
      <Route path='/sidebar' element={<ProtectedRoute element={<Sidebar/>}/>}/>
      <Route path='/Navbar' element={<ProtectedRoute element={<Navbar/>}/>}/>
      <Route path='/sdlc' element={<ProtectedRoute element={<SDLC/>}/>}/>
      <Route path='/topnavcontent' element={<ProtectedRoute element={<TopNavContent/>}/>}/>
      <Route path='/datatable' element={<ProtectedRoute element={<DataTable/>}/>}/>
      <Route path='/LighthouseLoader' element={<ProtectedRoute element={<LighthouseLoader/>}/>}/>
      <Route path='/practice' element={<ProtectedRoute element={<Practice/>}/>}/>
    
    </Routes>
  )
}

export default AppRoutes
