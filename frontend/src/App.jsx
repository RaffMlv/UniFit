import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import EsqueciSenha from '@/pages/EsqueciSenha'
import Triagem from '@/pages/Triagem'
import Inicio from '@/pages/Inicio'
import Financeiro from './pages/Financeiro'
import Perfil from './pages/Perfil'
import Agendamento from './pages/Agendamento'
import Biblioteca from './pages/Biblioteca'
import RotaProtegida from '@/routes/RotaProtegida'
import InicioAdmin from '@/pages/InicioAdmin'
import PaginaExercicio from '@/pages/PaginaExercicio'
import AdminExercicios from './pages/AdminExercicio'
import AdminAlunos from './pages/AdminAlunos'
import AdminAlunoDetalhe from './pages/AdminAlunoDetalhe'
import { rotaInicial } from './routes/rotaInicial'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'

function RedirecionarInicio() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  return <Navigate to={usuario ? rotaInicial(usuario.papel) : '/login'} replace />
}

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
      <Route path="/inicio" element={
        <RotaProtegida roles={['aluno', 'monitor']}><Inicio /></RotaProtegida>
      } />
      <Route path="/inicio-admin"element={<RotaProtegida roles={['admin']}> <InicioAdmin /></RotaProtegida>}/>
      <Route path="*" element={<RedirecionarInicio />} />
      <Route path="/financeiro" element={
        <RotaProtegida roles={['aluno']}><Financeiro /></RotaProtegida>
      } />
      <Route path="/agendamentos" element={<RotaProtegida><Agendamento /></RotaProtegida>} />
      <Route path="/biblioteca" element={<RotaProtegida><Biblioteca /></RotaProtegida>} />
      <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
      <Route path="/exercicios/:id" element={<RotaProtegida><PaginaExercicio /></RotaProtegida>} />
      <Route path="/admin/exercicios" element={
      <RotaProtegida roles={['admin']}><AdminExercicios /></RotaProtegida>
      } />
      <Route path="/admin/alunos" element={
      <RotaProtegida roles={['admin']}><AdminAlunos /></RotaProtegida>
      } />
      <Route path="/admin/alunos/:id" element={
        <RotaProtegida roles={['admin']}><AdminAlunoDetalhe /></RotaProtegida>
      } />
    </Routes>
  )
}