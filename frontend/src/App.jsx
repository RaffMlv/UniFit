import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import EsqueciSenha from '@/pages/EsqueciSenha'
import Triagem from '@/pages/Triagem'
import Inicio from '@/pages/Inicio'
import Financeiro from './pages/Financeiro'
import Perfil from './pages/Perfil'
import Agendamento from './pages/Agendamento'
import Agenda from './pages/Agenda'
import Progresso from './pages/Progresso'
import Biblioteca from './pages/Biblioteca'
import RotaProtegida from '@/routes/RotaProtegida'
import InicioAdmin from '@/pages/InicioAdmin'
import PaginaExercicio from '@/pages/PaginaExercicio'
import AdminExercicios from './pages/AdminExercicio'
import AdminAlunos from './pages/AdminAlunos'
import AdminAlunoDetalhe from './pages/AdminAlunoDetalhe'
import MeusTreinos from './pages/MeusTreinos'
import EditarFicha from './pages/EditarFicha'
import AdminEquipamentos from './pages/AdminEquipamentos'
import Aulas from './pages/Aulas'
import Consulta from '@/pages/Consulta'
import Acompanhamento from '@/pages/Acompanhamento'
import AdminMonitores from '@/pages/AdminMonitores'
import AdminTreinos from '@/pages/AdminTreinos'
import AdminAulas from '@/pages/AdminAulas'
import AdminAtendimentos from '@/pages/AdminAtendimentos'
import AdminFinanceiro from '@/pages/AdminFinanceiro'
import AdminRelatorios from '@/pages/AdminRelatorios'
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
      <Route path="/triagem" element={<RotaProtegida roles={['aluno']} ignorarTriagem><TriagemRota /></RotaProtegida>}/>
      <Route path="/inicio" element={<RotaProtegida roles={['aluno', 'monitor']}><Inicio /></RotaProtegida>} />
      <Route path="/inicio-admin"element={<RotaProtegida roles={['admin']}> <InicioAdmin /></RotaProtegida>}/>
      <Route path="*" element={<RedirecionarInicio />} />
      <Route path="/financeiro" element={<RotaProtegida roles={['aluno']}><Financeiro /></RotaProtegida>} />
      <Route path="/agendamentos" element={<RotaProtegida><Agendamento /></RotaProtegida>} />
      <Route path="/agenda" element={<RotaProtegida roles={['aluno']}><Agenda /></RotaProtegida>} />
      <Route path="/progresso" element={<RotaProtegida roles={['aluno']}><Progresso /></RotaProtegida>} />
      <Route path="/biblioteca" element={<RotaProtegida><Biblioteca /></RotaProtegida>} />
      <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
      <Route path="/exercicios/:id" element={<RotaProtegida><PaginaExercicio /></RotaProtegida>} />
      <Route path="/admin/exercicios" element={<RotaProtegida roles={['admin']}><AdminExercicios /></RotaProtegida>} />
      <Route path="/admin/alunos" element={<RotaProtegida roles={['admin']}><AdminAlunos /></RotaProtegida>} />
      <Route path="/admin/alunos/:id" element={<RotaProtegida roles={['admin']}><AdminAlunoDetalhe /></RotaProtegida>} />
      <Route path="/admin/equipamentos" element={<RotaProtegida roles={['admin']}><AdminEquipamentos /></RotaProtegida>} />
      <Route path="/meus-treinos" element={<RotaProtegida roles={['aluno']}><MeusTreinos /></RotaProtegida>} />
      <Route path="/fichas/nova/:alunoId" element={<RotaProtegida roles={['monitor', 'admin']}><EditarFicha /></RotaProtegida>} />
      <Route path="/fichas/:id/editar" element={<RotaProtegida roles={['monitor', 'admin']}><EditarFicha /></RotaProtegida>} />
      <Route path="/aulas" element={<RotaProtegida roles={['aluno']}><Aulas /></RotaProtegida>} />
      <Route path="/consulta" element={<RotaProtegida roles={['aluno']}><Consulta /></RotaProtegida>}/>      
      <Route path="/acompanhamento"element={<RotaProtegida roles={['aluno']}><Acompanhamento /></RotaProtegida>}/>
      <Route path="/admin/monitores" element={<RotaProtegida roles={['admin']}><AdminMonitores /></RotaProtegida>}/>
      <Route path="/admin/treinos" element={<RotaProtegida roles={['admin']}><AdminTreinos /></RotaProtegida>} />
      <Route path="/admin/aulas" element={<RotaProtegida roles={['admin']}><AdminAulas /></RotaProtegida>} />
      <Route path="/admin/atendimentos" element={<RotaProtegida roles={['admin']}><AdminAtendimentos /></RotaProtegida>} />
      <Route path="/admin/financeiro" element={<RotaProtegida roles={['admin']}><AdminFinanceiro /></RotaProtegida>} />
      <Route path="/admin/relatorios" element={<RotaProtegida roles={['admin']}><AdminRelatorios /></RotaProtegida>} />
    </Routes>
  )
}