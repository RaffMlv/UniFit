import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import EsqueciSenha from '@/pages/EsqueciSenha'
import Triagem from '@/pages/Triagem'
import Inicio from '@/pages/Inicio'
import RotaProtegida from '@/routes/RotaProtegida'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'

function TriagemRota() {
  const { atualizarUsuario } = useAuth()

  async function concluir(dados) {
    await api('/triagem', { method: 'POST', body: dados })
    await atualizarUsuario()
  }

  return <Triagem onConcluir={concluir} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/triagem" element={
        <RotaProtegida roles={['aluno']} ignorarTriagem><TriagemRota /></RotaProtegida>
      } />
      <Route path="/inicio" element={<RotaProtegida><Inicio /></RotaProtegida>} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}