import { useEffect } from 'react';

const APP_NAME = 'Amigo Secreto';

// Título da aba do navegador: "Página · Amigo Secreto".
export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
};
