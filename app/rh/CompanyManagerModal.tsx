"use client";

import { useState } from "react";
import { Building2, X } from "lucide-react";

interface CompanyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export default function CompanyManagerModal({
  isOpen,
  onClose,
  onSave,
}: CompanyManagerModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetAndClose = () => {
    setName("");
    setError(null);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (normalizedName.length < 2) {
      setError("Informe um nome de empresa válido.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(normalizedName);
      setName("");
      setIsSaving(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível cadastrar a empresa.",
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241A1D]/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-[#E9E0E2] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EFEC] text-[#641C32]">
              <Building2 size={20} />
            </span>
            <h2 className="font-serif text-3xl text-[#241A1D]">Nova empresa</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#776A6E]">
              Depois de cadastrar, a empresa aparecerá no filtro e no cadastro
              de novos colaboradores.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={isSaving}
            aria-label="Fechar"
            className="rounded-full p-2 text-[#776A6E] transition hover:bg-[#F5EFEC]"
          >
            <X size={20} />
          </button>
        </div>

        <form className="mt-7" onSubmit={handleSubmit}>
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#776A6E]">
              Nome da empresa
            </span>
            <input
              autoFocus
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Empresa Horizonte"
              className="w-full rounded-xl border border-[#E9E0E2] px-4 py-3 text-sm outline-none transition focus:border-[#641C32] focus:ring-2 focus:ring-[#641C32]/10"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-xl bg-[#FFF1F3] px-4 py-3 text-sm text-[#A4183A]">
              {error}
            </p>
          )}

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={isSaving}
              className="rounded-full border border-[#E9E0E2] px-5 py-2.5 text-sm font-semibold text-[#641C32] transition hover:bg-[#F5EFEC] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[#641C32] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7D2943] disabled:cursor-wait disabled:opacity-60"
            >
              {isSaving ? "Cadastrando..." : "Cadastrar empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
