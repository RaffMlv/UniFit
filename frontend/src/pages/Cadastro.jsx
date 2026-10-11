import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

const soDigitos = (v) => v.replace(/\D/g, '')

function validar(d) {
  const erros = {}
  if (d.nome.trim().length < 3) erros.nome = 'Resposta inválida'
  if (soDigitos(d.cpf).length !== 11) erros.cpf = 'Resposta inválida'
  if (!/^\S+@\S+\.\S+$/.test(d.email)) erros.email = 'Resposta inválida'
  if (d.senha.length < 8) erros.senha = 'A senha deve ter ao menos 8 caracteres'
  if (d.confirmar !== d.senha || !d.confirmar) erros.confirmar = 'As senhas não coincidem'
  if (!d.termos) erros.termos = 'Aceite os termos para continuar'
  return erros
}

export default function Cadastro() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState({
    nome: '', cpf: '', email: '', senha: '', confirmar: '', termos: false,
  })
  const [tocado, setTocado] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const erros = validar(dados)
  const valido = Object.keys(erros).length === 0

  const alterar = (campo) => (e) =>
    setDados({ ...dados, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const marcar = (campo) => () => setTocado({ ...tocado, [campo]: true })
  const erroDe = (campo) => tocado[campo] && erros[campo]

  async function enviar(e) {
    e.preventDefault()
    if (!valido) return
    setErroGeral('')
    try {
      setEnviando(true)
      await api('/auth/cadastro', {
        method: 'POST',
        body: { nome: dados.nome.trim(), cpf: dados.cpf, email: dados.email.trim(), senha: dados.senha },
      })
      await login(dados.email.trim(), dados.senha)
      navigate('/inicio')
    } catch (err) {
      setErroGeral(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const campo = (id, rotulo, placeholder, tipo = 'text') => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      <Input id={id} type={tipo} placeholder={placeholder} value={dados[id]}
        onChange={alterar(id)} onBlur={marcar(id)} aria-invalid={!!erroDe(id)} />
      {erroDe(id) && <p className="text-sm text-red-600">{erros[id]}</p>}
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-2xl font-bold">UniFit</div>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Preencha seus dados para começar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviar} className="space-y-4" noValidate>
            {campo('nome', 'Nome completo', 'Seu nome completo')}
            {campo('cpf', 'CPF', '000.000.000-00')}
            {campo('email', 'E-mail', 'seuemail@unifor.br', 'email')}
            {campo('senha', 'Senha', 'Mínimo de 8 caracteres', 'password')}
            {campo('confirmar', 'Confirmar senha', 'Repita a senha', 'password')}

            <div className="space-y-1.5">
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={dados.termos}
                  onChange={alterar('termos')} onBlur={marcar('termos')} className="mt-1" />
                <span>Li e aceito os Termos de Uso e a Política de Privacidade.</span>
              </label>
              {erroDe('termos') && <p className="text-sm text-red-600">{erros.termos}</p>}
            </div>

            {erroGeral && <p role="alert" className="text-sm text-red-600">{erroGeral}</p>}

            <Button type="submit" className="w-full" disabled={!valido || enviando}>
              {enviando ? 'Criando...' : 'Criar conta'}
            </Button>

            <p className="text-center text-sm">
              Já tem conta? <Link to="/login" className="underline">Entrar</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}