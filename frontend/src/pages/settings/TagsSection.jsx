import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorText, inputClass, primaryButtonClass } from "../../components/ui/ui";
import { createTag, deleteTag } from "../../http/tags";

// The tags that can be picked on an expense (e.g. wakacje, remont). A tag in use cannot be deleted.
const TagsSection = ({ tags }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const onSuccess = () => queryClient.invalidateQueries({ queryKey: ["tags"] });

  const create = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      setName("");
      onSuccess();
    },
  });
  const remove = useMutation({ mutationFn: deleteTag, onSuccess });

  function handleSubmit(event) {
    event.preventDefault();
    create.mutate(name);
  }

  return (
    <div className="flex flex-col gap-4">
      {tags.length === 0 && (
        <p className="text-neutral-500">Brak tagów. Dodaj pierwszy, np. „wakacje” albo „remont”.</p>
      )}

      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag} className="flex items-center rounded-full bg-neutral-800">
            <span className="pl-4 py-2 font-medium">#{tag}</span>
            <button
              type="button"
              aria-label={`Usuń tag ${tag}`}
              disabled={remove.isPending}
              onClick={() => remove.mutate(tag)}
              className="h-10 w-10 rounded-full text-lg text-danger"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          aria-label="Nowy tag"
          placeholder="Nowy tag"
          autoCapitalize="none"
          maxLength={30}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <button type="submit" disabled={create.isPending} className={`${primaryButtonClass} shrink-0`}>
          Dodaj
        </button>
      </form>

      <ErrorText>{create.error ?? remove.error}</ErrorText>
    </div>
  );
};

export default TagsSection;
