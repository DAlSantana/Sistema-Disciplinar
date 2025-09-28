import type { ReactNode } from "react";

interface CartaoMetricaProps {
  titulo: string;
  valor: string;
  descricao: string;
  icon: ReactNode;
  corValor?: string;
}

export default function CartaoMetrica({
  titulo,
  valor,
  descricao,
  icon,
  corValor = "text-sis-blue"
}: CartaoMetricaProps) {
  return (
    <div className="w-full rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-roboto text-base font-semibold text-sis-dark-text sm:text-lg">
          {titulo}
        </h3>
        <div className="text-sis-secondary-text">
          {icon}
        </div>
      </div>

      <div className="mb-2">
        <span className={`font-open-sans text-4xl font-extrabold leading-tight sm:text-5xl ${corValor}`}>
          {valor}
        </span>
      </div>

      <div className="mt-1">
        <span className="font-roboto text-sm text-sis-secondary-text">
          {descricao}
        </span>
      </div>
    </div>
  );
}
