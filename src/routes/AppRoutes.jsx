import { Route, Routes } from 'react-router-dom'
import Login from '../pages/login/Login'
import Users from '../pages/contents/Users'
import Team from '../pages/contents/Team'
import SDLC from '../pages/contents/SDLC'
import RolesTable from '../pages/dialog/editdialog/EditRole'
import Charging from '../pages/contents/Charging'
import UserPage from '../userpage/userPage'
import DataTable from '../component/reuseable/DataTable'
import Confirmation from '../component/reuseable/Confirmation'
import EditTeam from '../pages/dialog/editdialog/EditTeam'
import UserArchive from '../pages/dialog/archivedialog/UserArchive'
import Role from '../pages/contents/Role'
import Dashboard from '../pages/contents/Dashboard'
import TopNavContent from '../component/TopNavContent'
import Systems from '../pages/contents/Systems'
import SystemCategory from '../pages/contents/SystemCategory'
import Navbar from '../component/navbar'
import Sidebarw from '../component/Sidebarw'
import Category from '../pages/contents/category'
import Sidebar from '../component/sidebar'




const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Login />} />
      {/* <Route path="*" element={<Navbar />} /> */}
      <Route path="/login" element={<Login />} />

      <Route element={<Navbar />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Users" element={<Users />} />
        <Route path="/Users/archive" element={<UserArchive />} />
        <Route path="/Role" element={<Role />} />
        <Route path="/Team" element={<Team />} />
        <Route path="/Charging" element={<Charging />} />
        <Route path="/Systems" element={<Systems />} />
        <Route path="/SystemCategory/:systemName" element={<SystemCategory />} />
        <Route path="/category" element={<Category />} />
      </Route>

      <Route path='/sidebar' element={<Sidebar/>}/>
      <Route path='/Navbar' element={<Navbar/>}/>
      <Route path='/sdlc' element={<SDLC/>}/>
      <Route path='/editrole' element={<RolesTable/>}/>
      <Route path='/topnavcontent' element={<TopNavContent/>}/>
      <Route path='/editteam' element={<EditTeam/>}/>
      <Route path='/sidebarw' element={<Sidebarw/>}/>


      <Route path='/datatable' element={<DataTable/>}/>
      {/* <Route path='/confirmation' element={<Confirmation/>}/>
       <Route path='/snackbar' element={<Snackbar/>}/> */}

    </Routes>
  )
}

export default AppRoutes
