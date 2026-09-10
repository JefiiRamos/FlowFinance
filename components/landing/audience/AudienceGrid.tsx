'use client'

import {
  Briefcase,
  Laptop,
  Percent,
  Users,
} from 'lucide-react'

import { AudienceCard } from './AudienceCard'

const AUDIENCES = [
  {
    icon: Laptop,
    title: 'Freelancers & autônomos',
    description:
      'Projetos que entram e saem, clientes que pagam em prazos diferentes. Você precisa saber quanto guardar nos meses bons.',
    example: '"Ganhei R$ 8.000 em março — quanto posso gastar sem me arrepender em abril?"',
  },
  {
    icon: Briefcase,
    title: 'Consultores & prestadores',
    description:
      'Honorários variáveis, despesas fixas altas e metas de crescimento. Clareza financeira vira vantagem competitiva.',
    example: '"Tenho R$ 3.200 de despesas fixas — minha renda cobre isso nos meses fracos?"',
  },
  {
    icon: Percent,
    title: 'Comissionados',
    description:
      'Meses de pico e meses de seca. O FlowFinance suaviza a incerteza com projeções baseadas no seu histórico real.',
    example: '"Vendi bem esse mês — devo antecipar parcelas ou reforçar a reserva?"',
  },
  {
    icon: Users,
    title: 'Profissionais criativos',
    description:
      'Designers, devs, redatores e criadores que vivem de projetos. Organize tudo sem perder tempo com burocracia.',
    example: '"Recebi três pagamentos essa semana — onde foi parar meu dinheiro?"',
  },
]

export function AudienceGrid() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
      {AUDIENCES.map((item, index) => (
        <AudienceCard
          key={item.title}
          {...item}
          delay={index * 0.1}
        />
      ))}
    </div>
  )
}
