import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Dumbbell, X, ArrowRight, ImageOff } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { exerciciosExemplo } from '@/data/exerciciosExemplo'

const todos = 'Todos'
const opcoes = (campo) => [todos, ...new Set(exerciciosExemplo.map(x => x[campo]))]

export default function Biblioteca() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [musculo, setMusculo] = useState(todos)
  const [equipamento, setEquipamento] = useState(todos)
  const [nivel, setNivel] = useState(todos)
  const [categoria, setCategoria] = useState(todos)
  const [mostrarFiltros, setMostrarFiltros] = useState(true)
  const resultados = useMemo(() => exerciciosExemplo.filter(exercicio => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    const pesquisavel = [exercicio.nome, exercicio.musculo, exercicio.equipamento].join(' ').toLocaleLowerCase('pt-BR')
    return pesquisavel.includes(termo) && (musculo === todos || exercicio.musculo === musculo) && (equipamento === todos || exercicio.equipamento === equipamento) && (nivel === todos || exercicio.nivel === nivel) && (categoria === todos || exercicio.categoria === categoria)
  }), [busca, musculo, equipamento, nivel, categoria])
  function limpar() { setBusca(''); setMusculo(todos); setEquipamento(todos); setNivel(todos); setCategoria(todos) }
  return (
    <LayoutAutenticado titulo="Biblioteca de exercícios">
      <div className="space-y-6 text-[#142191]">
        <div>
          <p className="text-sm font-semibold text-[#004AF7]">EXERCÍCIOS UNIFIT</p>
          <h2 className="mt-1 font-heading text-4xl font-bold">BIBLIOTECA DE EXERCÍCIOS</h2>
          <p className="mt-2 text-sm text-slate-600">Pesquise por exercício, grupo muscular ou equipamento.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-[#004AF7]">
              <Search size={20} className="text-[#004AF7]" aria-hidden="true" />
              <span className="sr-only">Pesquisar exercício</span>
              <input value={busca} onChange={e => setBusca(e.target.value)} type="search" placeholder="Pesquisar exercício, músculo ou equipamento" className="min-h-12 w-full bg-transparent text-sm text-slate-800 outline-none" />
            </label>
            <button type="button" aria-expanded={mostrarFiltros} onClick={() => setMostrarFiltros(x => !x)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#004AF7] px-5 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD]"><SlidersHorizontal size={18} /> Filtros</button>
          </div>
          {mostrarFiltros && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Filtro rotulo="Grupo muscular" valor={musculo} onChange={setMusculo} opcoes={opcoes('musculo')} />
              <Filtro rotulo="Equipamento" valor={equipamento} onChange={setEquipamento} opcoes={opcoes('equipamento')} />
              <Filtro rotulo="Nível" valor={nivel} onChange={setNivel} opcoes={opcoes('nivel')} />
              <Filtro rotulo="Categoria" valor={categoria} onChange={setCategoria} opcoes={opcoes('categoria')} />
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-600">{resultados.length} {resultados.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}</span>
            <button type="button" onClick={limpar} className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AF7] hover:underline"><X size={16} /> Limpar todos os filtros</button>
          </div>
        </div>
        {resultados.length ? (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Resultados de exercícios">
            {resultados.map(exercicio => (
              <article key={exercicio.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#E4F2FD]">
                  {exercicio.imagem ? <img src={exercicio.imagem} alt={`Demonstração de ${exercicio.nome}`} className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-[#142191]"><ImageOff size={34} strokeWidth={1.5} /><span className="text-xs">Imagem não cadastrada</span></div>}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold">{exercicio.musculo}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{exercicio.nivel}</span></div>
                  <h2 className="font-heading text-2xl font-bold">{exercicio.nome}</h2>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><Dumbbell size={16} /> {exercicio.equipamento} · {exercicio.categoria}</p>
                  <button type="button" onClick={() => navigate(`/exercicios/${exercicio.id}`)} className="mt-auto inline-flex items-center justify-between rounded-lg bg-[#004AF7] px-4 py-3 text-sm font-semibold text-white hover:bg-[#142191]">Ver exercício <ArrowRight size={16} /></button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center"><Search className="mx-auto text-[#004AF7]" size={36}/><h2 className="mt-4 font-heading text-2xl font-bold">NENHUM EXERCÍCIO ENCONTRADO</h2><p className="mt-2 text-sm text-slate-600">Tente outros termos ou limpe os filtros.</p><button type="button" onClick={limpar} className="mt-5 rounded-lg bg-[#004AF7] px-5 py-3 font-semibold text-white">Limpar filtros</button></div>
        )}
        <p className="text-xs text-slate-500">Biblioteca demonstrativa: os exercícios, imagens, categorias e níveis definitivos deverão vir do cadastro administrativo.</p>
      </div>
    </LayoutAutenticado>
  )
}

function Filtro({ rotulo, valor, onChange, opcoes }) {
  return <label className="block text-sm font-semibold">{rotulo}<select value={valor} onChange={e => onChange(e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus:border-[#004AF7]">{opcoes.map(op => <option key={op} value={op}>{op}</option>)}</select></label>
}