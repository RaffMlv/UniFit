import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

export default function TutorialUniFit() {
  const navigate = useNavigate()

  return (
    <LayoutAutenticado titulo="Tutorial do UniFit">
      <section className="mb-8">
        <button
          type="button"
          onClick={() => navigate('/inicio')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#004AF7] hover:text-[#142191]"
        >
          <ArrowLeft size={18} />
          Voltar para o início
        </button>

        <div className="mb-4 flex items-center gap-3">
          <BookOpen size={32} className="text-[#004AF7]" />

          <h2 className="font-heading text-3xl font-bold text-[#142191]">
            Conheça o UniFit
          </h2>
        </div>

        <p className="max-w-3xl text-slate-600">
          O UniFit é a plataforma de saúde e treinamento da Unifor.
          Aqui você pode organizar seus treinos, acompanhar sua evolução
          e acessar os serviços disponíveis para você.
        </p>
      </section>

      {/* As explicações das funcionalidades serão adicionadas aqui. */}
    </LayoutAutenticado>
  )
}