"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateText } from "@/lib/formatters";

// Simples cache em memória para a sessão atual
const translationCache = new Map<string, string>();

export function useDynamicTranslation(originalText: string) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(originalText);
  const [loading, setLoading] = useState(false);
  const lastLanguageRef = useRef(language);

  useEffect(() => {
    // Se o texto estiver vazio, não faz nada
    if (!originalText) {
      setTranslatedText("");
      return;
    }

    // Cria uma chave única para o cache baseada no texto e no idioma
    const cacheKey = `${language}:${originalText}`;

    // Se já estiver no cache, usa ele imediatamente
    if (translationCache.has(cacheKey)) {
      setTranslatedText(translationCache.get(cacheKey)!);
      return;
    }

    // Função interna para buscar a tradução
    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const translated = await translateText(originalText, language);
        // Salva no cache e atualiza o estado
        translationCache.set(cacheKey, translated);
        setTranslatedText(translated);
      } catch (e) {
        console.error("Erro no useDynamicTranslation:", e);
        // Fallback para o texto original
        setTranslatedText(originalText);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [originalText, language]);

  return { translatedText, loading };
}
