import React, { useState, useEffect } from 'react';

const loadingTexts = [
  "Inicializando conexão segura...",
  "Buscando metadados do repositório...",
  "Construindo árvore de dependências hipotética...",
  "Verificando vulnerabilidades conhecidas...",
  "Cruzando referências com assinaturas do ataque de Set 2025...",
  "Analisando padrões de código em busca de anomalias...",
  "Finalizando relatório de segurança...",
];

export const LoadingIndicator: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 1800);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
      <p className="text-lg text-gray-300 transition-opacity duration-500">{loadingTexts[index]}</p>
    </div>
  );
};