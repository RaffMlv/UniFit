import { Link } from 'react-router-dom'
import { ArrowLeft, LockKeyhole, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
return (
    <main className="flex min-h-screen items-center justify-center bg-[#E4F2FD] px-5 py-10">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardHeader className="px-6 pt-8 text-center sm:px-8">
          <div className="mb-6 font-heading text-4xl font-bold text-[#142191]">
            UNI<span className="text-[#004AF7]">FIT</span>
          </div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E4F2FD] text-[#004AF7]">
            {enviado ? (
              <MailCheck size={28} aria-hidden="true" />
            ) : (
              <LockKeyhole size={28} aria-hidden="true" />
            )}
          </div>
          <CardTitle className="font-heading text-3xl font-bold text-[#142191]">
            {enviado ? 'Solicitação recebida!' : 'Esqueceu sua senha?'}
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
            {enviado
              ? 'Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinir sua senha.'
              : 'Informe seu e-mail cadastrado para solicitar a recuperação da sua conta.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 sm:px-8">
          {!enviado ? (
            <form onSubmit={enviar} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#142191]">
                  E-mail cadastrado
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  required
                  className="h-12 rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:border-[#004AF7] focus-visible:ring-[#004AF7]/25"
                />
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
                disabled={enviando}
                className="min-h-12 w-full rounded-lg bg-[#004AF7] px-4 py-3 text-base font-semibold text-white hover:bg-[#142191] disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : 'Enviar instruções'}
              </Button>
            </form>
          ) : (
            <div
              role="status"
              className="rounded-lg bg-[#E4F2FD] p-4 text-center text-sm leading-6 text-[#142191]"
            >
              Confira sua caixa de entrada e a pasta de spam.
            </div>
          )}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[#004AF7] hover:underline"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )