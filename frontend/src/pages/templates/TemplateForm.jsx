import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ErrorText,
  Field,
  PageHeader,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import PresetFields, {
  presetInitialValues,
  presetPayload,
} from "../../components/ui/PresetFields";
import {
  createTemplate,
  deleteTemplate,
  fetchTemplate,
  updateTemplate,
} from "../../http/templates";
import { useReferenceData } from "../../util/useReferenceData";

const TemplateEditor = ({ template, categoryTree, members }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !template;
  const [form, setForm] = useState(() => presetInitialValues(template, members));

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function finish() {
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    navigate("/templates");
  }

  const save = useMutation({
    mutationFn: (values) =>
      isNew ? createTemplate(values) : updateTemplate({ id: template.id, values }),
    onSuccess: finish,
  });

  const remove = useMutation({
    mutationFn: () => deleteTemplate(template.id),
    onSuccess: finish,
  });

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate({
      ...presetPayload(form),
      name: form.name,
      title: form.title.trim() || null,
    });
  }

  function handleDelete() {
    if (window.confirm("Usunąć ten szablon?")) {
      remove.mutate();
    }
  }

  const busy = save.isPending || remove.isPending;

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-5">
      <Field label="Nazwa przycisku" htmlFor="template-name">
        <input
          id="template-name"
          type="text"
          required
          autoFocus={isNew}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Tytuł wydatku (opcjonalnie, domyślnie nazwa)" htmlFor="template-title">
        <input
          id="template-title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
      </Field>

      <PresetFields
        form={form}
        update={update}
        categoryTree={categoryTree}
        members={members}
        priceRequired={false}
      />

      <ErrorText>{save.error ?? remove.error}</ErrorText>

      <div className="flex flex-col gap-3">
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {save.isPending ? "Zapisywanie..." : "Zapisz"}
        </button>
        <Link to="/templates" className={`${secondaryButtonClass} flex items-center justify-center`}>
          Anuluj
        </Link>
        {!isNew && (
          <button type="button" disabled={busy} onClick={handleDelete} className={dangerButtonClass}>
            Usuń szablon
          </button>
        )}
      </div>
    </form>
  );
};

const TemplateForm = () => {
  const { id } = useParams();
  const isNew = id === "new";
  const { categoryTree, members, ready, error } = useReferenceData();

  const templateQuery = useQuery({
    queryKey: ["template", id],
    queryFn: () => fetchTemplate(id),
    enabled: !isNew,
  });

  const loaded = ready && (isNew || templateQuery.isSuccess);
  const missing = !isNew && templateQuery.isSuccess && !templateQuery.data;
  const needsSetup = ready && (categoryTree.length === 0 || members.length === 0);

  return (
    <>
      <PageHeader title={isNew ? "Nowy szablon" : "Edycja szablonu"} />
      <ErrorText>{error ?? templateQuery.error}</ErrorText>
      {!loaded && !error && <p className="px-4 text-neutral-400">Wczytywanie...</p>}
      {missing && <p className="px-4 text-neutral-300">Nie znaleziono szablonu.</p>}

      {needsSetup && (
        <p className="px-4 text-neutral-300">
          Najpierw dodaj domowników i kategorie w{" "}
          <Link to="/settings" className="text-secondColor underline">
            ustawieniach
          </Link>
          .
        </p>
      )}

      {loaded && !missing && !needsSetup && (
        <TemplateEditor
          key={id}
          template={isNew ? null : templateQuery.data}
          categoryTree={categoryTree}
          members={members}
        />
      )}
    </>
  );
};

export default TemplateForm;
