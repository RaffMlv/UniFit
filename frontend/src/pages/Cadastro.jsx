import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

function validar(d) {
  const erros = {}
  const nome = d.nome.trim()
  const cpf = d.cpf.trim()
  const email = d.email.trim()

  const formatoCPF = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!nome) {
    erros.nome = 'Informe seu nome completo.'
  } else if (nome.length < 3) {
    erros.nome = 'O nome deve ter pelo menos 3 caracteres.'
  }

  if (!cpf) {
    erros.cpf = 'Informe seu CPF.'
  } else if (!formatoCPF.test(cpf)) {
    erros.cpf = 'Use 11 números ou o formato 000.000.000-00.'
  }

  if (!email) {
    erros.email = 'Informe seu e-mail.'
  } else if (!formatoEmail.test(email)) {
    erros.email = 'Informe um e-mail válido.'
  }

  if (!d.senha) {
    erros.senha = 'Informe sua senha.'
  } else if (d.senha.length < 8) {
    erros.senha = 'A senha deve ter ao menos 8 caracteres.'
  }

  if (!d.confirmar) {
    erros.confirmar = 'Confirme sua senha.'
  } else if (d.confirmar !== d.senha) {
    erros.confirmar = 'As senhas não coincidem.'
  }

  if (!d.termos) {
    erros.termos = 'Aceite os termos para continuar.'
  }

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
  if (enviando) return

  setErroGeral('')

  setTocado({
    nome: true,
    cpf: true,
    email: true,
    senha: true,
    confirmar: true,
    termos: true,
  })

  if (!valido) return
    try {
      setEnviando(true)
      await api('/auth/cadastro', {
        method: 'POST',
        body: { nome: dados.nome.trim(), cpf: dados.cpf.trim(), email: dados.email.trim(), senha: dados.senha },
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

    <Input
      id={id}
      type={tipo}
      placeholder={placeholder}
      value={dados[id]}
      onChange={alterar(id)}
      onBlur={marcar(id)}
      aria-invalid={!!erroDe(id)}
      aria-describedby={erroDe(id) ? `erro-${id}` : undefined} 
    />

    {erroDe(id) && (
      <p id={`erro-${id}`} className="text-sm text-red-600">
        {erros[id]}
      </p>
    )}
  </div>
)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E4F2FD] px-5 py-10">
      <Card className="w-full max-w-2xl border-0 bg-white shadow-lg">
        <CardHeader className="px-6 pt-8 text-center sm:px-10">
          <div className="mb-6 font-heading text-4xl font-bold text-[#142191]">
            UNI<span className="text-[#004AF7]">FIT</span>
          </div>
          <CardTitle className="font-heading text-3xl font-bold text-[#142191]">
            Crie sua conta
          </CardTitle>
          <CardDescription className="mt-2 text-slate-600">
            Preencha seus dados para fazer parte do UniFit.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 sm:px-10">
          <form onSubmit={enviar} className="space-y-5" noValidate>
            {campo('nome', 'Nome completo', 'Seu nome completo')}
            <div className="grid gap-5 sm:grid-cols-2">
              {campo('cpf', 'CPF', '000.000.000-00')}
              {campo('email', 'E-mail', 'seuemail@unifor.br', 'email')}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {campo('senha', 'Senha', 'Mínimo de 8 caracteres', 'password')}
              {campo('confirmar', 'Confirmar senha', 'Repita a senha', 'password')}
            </div>
            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <input
                  type="checkbox"
                  checked={dados.termos}
                  onChange={alterar('termos')}
                  onBlur={marcar('termos')}
                  aria-invalid={!!erroDe('termos')}
                  aria-describedby={
                    erroDe('termos') ? 'erro-termos' : undefined
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#004AF7]"
                />
                <span>
                  Li e aceito os Termos de Uso e a Política de Privacidade.
                </span>
              </label>
              {erroDe('termos') && (
                <p id="erro-termos" className="text-sm text-red-600">
                  {erros.termos}
                </p>
              )}
            </div>
            {erroGeral && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {erroGeral}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={enviando}
            >
              {enviando ? 'Criando...' : 'Criar conta'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#004AF7] hover:underline"
              >
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}