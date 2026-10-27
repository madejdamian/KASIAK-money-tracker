-- Recurring deposits (e.g. the monthly transfer of each household member to the shared account).
-- Works like recurring expenses: every month an active rule is proposed, then confirmed or skipped.
create table expense_tracker.recurring_deposit
(
    id           bigint primary key,
    title        varchar        not null,
    amount       decimal(10, 2) not null,
    member_id    bigint         not null references expense_tracker.household_member (id),
    deposit_type varchar        not null,
    description  varchar,
    day_of_month int            not null,
    start_month  varchar        not null,
    active       boolean        not null default true,
    created_at   timestamp,
    updated_at   timestamp
);

create table expense_tracker.recurring_deposit_occurrence
(
    id           bigint primary key,
    recurring_id bigint  not null references expense_tracker.recurring_deposit (id),
    period_month varchar not null,
    status       varchar not null,
    created_at   timestamp,
    updated_at   timestamp,
    unique (recurring_id, period_month)
);
