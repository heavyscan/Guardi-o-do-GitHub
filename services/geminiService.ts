import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallStatus: {
      type: Type.STRING,
      description: "Um status de uma única palavra: 'SECURE', 'WARNING' ou 'VULNERABLE'.",
      enum: ["SECURE", "WARNING", "VULNERABLE"],
    },
    summary: {
      type: Type.STRING,
      description: "Um resumo de um parágrafo da análise de segurança.",
    },
    generalAnalysis: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description: "Uma pontuação de 0 a 100, onde 100 é o mais seguro.",
        },
        findings: {
          type: Type.ARRAY,
          description: "Uma lista de 3 a 5 potenciais vulnerabilidades gerais ou boas práticas de segurança observadas.",
          items: { type: Type.STRING },
        },
      },
    },
    supplyChainAttackAnalysis: {
      type: Type.OBJECT,
      properties: {
        vulnerable: {
          type: Type.BOOLEAN,
          description: "Verdadeiro se o repositório for provavelmente afetado pelo ataque à cadeia de suprimentos de setembro de 2025, caso contrário, falso.",
        },
        details: {
          type: Type.STRING,
          description: "Uma explicação detalhada dos achados relacionados ao ataque de setembro de 2025.",
        },
        affectedPackages: {
          type: Type.ARRAY,
          description: "Uma lista de pacotes potencialmente comprometidos e suas versões encontrados na árvore de dependências hipotética.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              version: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
        },
      },
    },
  },
  required: ['overallStatus', 'summary', 'generalAnalysis', 'supplyChainAttackAnalysis'],
};

const buildPrompt = (repoUrl: string): string => {
  return `
    Você é uma IA especialista em cibersegurança de classe mundial chamada "Guardião do GitHub". Sua tarefa é analisar um repositório do GitHub em busca de potenciais vulnerabilidades de segurança.

    **Repositório para Análise:** ${repoUrl}

    **Contexto da Análise:**
    Você deve realizar duas verificações principais:
    1.  **Verificação Geral de Código Malicioso:** Com base no nome e no propósito provável do repositório, infira uma pilha de tecnologia e uma árvore de dependências plausíveis. Analise essa base de código hipotética em busca de vulnerabilidades comuns, como segredos codificados (hardcoded secrets), dependências desatualizadas, possíveis falhas de injeção ou padrões de código suspeitos.
    2.  **Vetor de Ataque Específico da Cadeia de Suprimentos (Setembro de 2025):** Você deve verificar a existência de um ataque específico à cadeia de suprimentos, notório (mas fictício para este exercício), que ocorreu em setembro de 2025.
        *   **Detalhes do Ataque:** Uma campanha de phishing sofisticada teve como alvo os mantenedores de bibliotecas populares de código aberto. Isso resultou na injeção de código malicioso em versões específicas de mais de uma dúzia de pacotes.
        *   **Comportamento do Código Malicioso:** O código injetado era fortemente ofuscado. Geralmente, usava scripts de pós-instalação para escanear variáveis de ambiente (como chaves da AWS, tokens de API) e exfiltrá-las para um servidor remoto.
        *   **Pacotes Comprometidos Conhecidos (Exemplos):**
            *   \`express\` (versões 4.19.0 - 4.19.2)
            *   \`lodash\` (versões 4.17.22 - 4.17.23)
            *   \`axios\` (versões 1.6.9 - 1.7.1)
            *   \`chalk\` (versões 5.3.1 - 5.3.2)
            *   \`react-scripts\` (versões 5.0.2 - 5.0.3)
            *   \`@nestjs/core\` (versões 10.3.4 - 10.3.6)

    **Instruções:**
    1.  Com base na URL do repositório, infira o tipo de projeto (por exemplo, frontend React, backend Node.js, ciência de dados com Python).
    2.  Crie uma hipótese de um \`package.json\` ou \`requirements.txt\` realista para tal projeto.
    3.  Analise essas dependências hipotéticas em relação ao vetor de ataque de setembro de 2025.
    4.  Realize uma avaliação geral de segurança.
    5.  Forneça uma resposta estruturada em formato JSON de acordo com o schema fornecido. Seja criativo, mas realista em sua análise.
    `;
};


export const analyzeRepository = async (repoUrl: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("A variável de ambiente API_KEY não está definida.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = buildPrompt(repoUrl);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (e) {
    console.error("Falha ao analisar a resposta do Gemini:", jsonText);
    throw new Error("Não foi possível entender o resultado da análise. Por favor, tente novamente.");
  }
};