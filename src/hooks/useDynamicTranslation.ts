"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateTextAction } from "@/app/actions/dataActions";

// Simples cache em memória para a sessão atual
const translationCache = new Map<string, string>();
const SOURCE_LANGUAGE = "pt";

export function useDynamicTranslation(originalText: string) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(originalText);
  const [loading, setLoading] = useState(false);
  const shouldTranslate = Boolean(originalText) && language !== SOURCE_LANGUAGE;

  useEffect(() => {
    // As descrições já estão no idioma de origem; só outros idiomas precisam de tradução.
    if (!shouldTranslate) return;

    // Cria uma chave única para o cache baseada no texto e no idioma
    const cacheKey = `${language}:${originalText}`;

    const fetchTranslation = async () => {
      const cachedTranslation = translationCache.get(cacheKey);
      if (cachedTranslation) {
        setTranslatedText(cachedTranslation);
        return;
      }

      setLoading(true);
      try {
        const translated = await translateTextAction(originalText, language);
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
  }, [originalText, language, shouldTranslate]);

  return {
    translatedText: shouldTranslate ? translatedText : originalText,
    loading: shouldTranslate && loading,
  };
}
