import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import Inicio from '@/pages/Inicio'
import RotaProtegida from '@/routes/RotaProtegida'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/inicio" element={<RotaProtegida><Inicio /></RotaProtegida>} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}