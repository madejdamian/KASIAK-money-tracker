import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ErrorText,
  Field,
  PageHeader,
  Segmented,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchMembers } from "../../http/members";
import {
  createDeposit,
  deleteDeposit,
  fetchDeposit,
  updateDeposit,
} from "../../http/deposits";
import {
  fromApiDateTime,
  recallChoice,
  rememberChoice,
  toInputDateTime,
} from "../../util/format";

const typeOptions = [
  { value: "MONTHLY", label: "Miesięczna" },
  { value: "EXTRA", label: "Dodatkowa" },
];

const defaultTitle = {
  MONTHLY: "Wpłata miesięczna",
  EXTRA: "Wpłata dodatkowa",
};

function initialForm(deposit, members) {
  if (deposit) {
    return {
      title: deposit.title,
      amount: String(deposit.amount),
      date: fromApiDateTime(deposit.date),
      memberId: deposit.memberId == null ? "" : String(deposit.memberId),
      depositType: deposit.depositType ?? "MONTHLY",
      description: deposit.description ?? "",
    };
  }

  const lastMember = recallChoice("depositMemberId");
  return {
    title: "",
    amount: "",
    date: toInputDateTime(),
    memberId: members.some((m) => String(m.id) === lastMember)
      ? lastMember
      : String(members[0]?.id ?? ""),
    depositType: "MONTHLY",
    description: "",
  };
}

const DepositEditor = ({ deposit, members }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !deposit;
  const [form, setForm] = useState(() => initialForm(deposit, members));

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function finish() {
    queryClient.invalidateQueries({ queryKey: ["deposits"] });
    queryClient.invalidateQueries({ queryKey: ["deposit"] });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
    navigate(`/deposits?month=${form.date.slice(0, 7)}`);
  }

  const save = useMutation({
    mutationFn: (values) =>
      isNew ? createDeposit(values) : updateDeposit({ slug: deposit.slug, values }),
    onSuccess: () => {
      rememberChoice("depositMemberId", form.memberId);
      finish();
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteDeposit(deposit.slug),
    onSuccess: finish,
  });

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate({
      title: form.title.trim() || defaultTitle[form.depositType],
      amount: Number(form.amount),
      date: form.date.length === 16 ? `${form.date}:00` : form.date,
      memberId: Number(form.memberId),
      depositType: form.depositType,
      description: form.description.trim() || null,
    });
  }

  function handleDelete() {
    if (window.confirm("Usunąć tę wpłatę?")) {
      remove.mutate();
    }
  }

  const busy = save.isPending || remove.isPending;

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-5">
      <Field label="Kwota (zł)" htmlFor="amount">
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          autoFocus={isNew}
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
          className={`${inputClass} text-2xl h-14`}
        />
      </Field>

      <Field label="Kto wpłacił" htmlFor="member">
        <select
          id="member"
          required
          value={form.memberId}
          onChange={(e) => update("memberId", e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Wybierz domownika
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </Field>

      <Segmented
        name="depositType"
        value={form.depositType}
        onChange={(value) => update("depositType", value)}
        options={typeOptions}
      />

      <Field label="Data i godzina" htmlFor="date">
        <input
          id="date"
          type="datetime-local"
          required
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Tytuł (opcjonalnie)" htmlFor="title">
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Opis (opcjonalnie)" htmlFor="description">
        <textarea
          id="description"
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputClass} h-auto py-3`}
        />
      </Field>

      <ErrorText>{save.error ?? remove.error}</ErrorText>

      <div className="flex flex-col gap-3">
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {save.isPending ? "Zapisywanie..." : "Zapisz"}
        </button>
        <Link to="/deposits" className={`${secondaryButtonClass} flex items-center justify-center`}>
          Anuluj
        </Link>
        {!isNew && (
          <button type="button" disabled={busy} onClick={handleDelete} className={dangerButtonClass}>
            Usuń wpłatę
          </button>
        )}
      </div>
    </form>
  );
};

const DepositForm = () => {
  const { slug } = useParams();
  const isNew = slug === "new";

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });
  const depositQuery = useQuery({
    queryKey: ["deposit", slug],
    queryFn: () => fetchDeposit(slug),
    enabled: !isNew,
  });

  const members = membersQuery.data ?? [];
  const error = membersQuery.error ?? depositQuery.error;
  const ready = membersQuery.data && (isNew || depositQuery.data);
  const needsSetup = ready && members.length === 0;

  return (
    <>
      <PageHeader title={isNew ? "Nowa wpłata" : "Edycja wpłaty"} />
      <ErrorText>{error}</ErrorText>
      {!ready && !error && <p className="px-4 text-neutral-400">Wczytywanie...</p>}

      {needsSetup && (
        <p className="px-4 text-neutral-300">
          Najpierw dodaj domowników w{" "}
          <Link to="/settings" className="text-secondColor underline">
            ustawieniach
          </Link>
          .
        </p>
      )}

      {ready && !needsSetup && (
        <DepositEditor
          key={slug}
          deposit={isNew ? null : depositQuery.data}
          members={members}
        />
      )}
    </>
  );
};

export default DepositForm;
