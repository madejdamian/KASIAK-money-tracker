import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ErrorText,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { createMember, deleteMember, updateMember } from "../../http/members";

const MembersSection = ({ members }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  function reset() {
    setName("");
    setEditingId(null);
  }

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["members"] });
    reset();
  };

  const save = useMutation({
    mutationFn: (values) =>
      editingId == null ? createMember(values) : updateMember({ id: editingId, values }),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: deleteMember,
    onSuccess,
  });

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate({ name });
  }

  function handleDelete(member) {
    if (window.confirm(`Usunąć domownika ${member.name}?`)) {
      remove.mutate(member.id);
    }
  }

  return (
    <>
      <ul className="flex flex-col">
        {members.length === 0 && (
          <li className="text-neutral-500 py-2">Brak domowników. Dodaj pierwszego poniżej.</li>
        )}
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between gap-2 py-2 border-b border-neutral-800 last:border-b-0"
          >
            <span className="min-w-0 break-words">{member.name}</span>
            <span className="flex gap-2 shrink-0">
              <button
                type="button"
                className="h-10 px-3 rounded-lg bg-neutral-800 text-sm"
                onClick={() => {
                  setEditingId(member.id);
                  setName(member.name);
                }}
              >
                Zmień
              </button>
              <button
                type="button"
                className="h-10 px-3 rounded-lg bg-danger/15 text-sm font-semibold text-danger"
                onClick={() => handleDelete(member)}
              >
                Usuń
              </button>
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
        <input
          type="text"
          required
          aria-label="Imię domownika"
          placeholder={editingId == null ? "Imię nowego domownika" : "Nowe imię"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <ErrorText>{save.error ?? remove.error}</ErrorText>
        <div className="flex gap-3">
          <button type="submit" disabled={save.isPending} className={`${primaryButtonClass} flex-1`}>
            {editingId == null ? "Dodaj domownika" : "Zapisz zmianę"}
          </button>
          {editingId != null && (
            <button type="button" onClick={reset} className={secondaryButtonClass}>
              Anuluj
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default MembersSection;
