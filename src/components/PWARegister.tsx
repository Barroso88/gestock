"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA Service Worker registado com sucesso:", reg.scope);
          })
          .catch((err) => {
            console.log("Falha no registo do Service Worker:", err);
          });
      });
    }
  }, []);

  return null;
}
