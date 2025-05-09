/**
 * test-import.js
 * Arquivo simples para testar o suporte a importação dinâmica
 */

// Exportar uma função simples
export function testImport() {
  return "Import dinâmico funcionando!";
}

// Exportar versão
export const version = "1.0.0";

// Exportar objeto
export default {
  name: "TestImport",
  working: true,
  message: "Este arquivo é usado para testar se a importação dinâmica (ES6 Modules) funciona neste ambiente."
};
