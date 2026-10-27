create table expense_tracker.tag
(
    id         bigint primary key,
    name       varchar not null unique,
    created_at timestamp,
    updated_at timestamp
);

create table expense_tracker.expense_tag
(
    expense_id bigint not null references expense_tracker.expense (id) on delete cascade,
    tag_id     bigint not null references expense_tracker.tag (id),
    primary key (expense_id, tag_id)
);

create table expense_tracker.recurring_expense
(
    id             bigint primary key,
    title          varchar        not null,
    price          decimal(10, 2) not null,
    category_id    bigint         not null references expense_tracker.category (id),
    member_id      bigint         not null references expense_tracker.household_member (id),
    payment_source varchar        not null,
    usage_amount   decimal(12, 3),
    description    varchar,
    day_of_month   int            not null,
    start_month    varchar        not null,
    active         boolean        not null default true,
    created_at     timestamp,
    updated_at     timestamp
);

-- a month of a recurring expense that was confirmed (an expense was added) or skipped
create table expense_tracker.recurring_occurrence
(
    id           bigint primary key,
    recurring_id bigint  not null references expense_tracker.recurring_expense (id),
    period_month varchar not null,
    status       varchar not null,
    created_at   timestamp,
    updated_at   timestamp,
    unique (recurring_id, period_month)
);

create table expense_tracker.expense_template
(
    id             bigint primary key,
    name           varchar not null,
    title          varchar,
    price          decimal(10, 2),
    category_id    bigint  not null references expense_tracker.category (id),
    member_id      bigint  not null references expense_tracker.household_member (id),
    payment_source varchar not null,
    usage_amount   decimal(12, 3),
    description    varchar,
    created_at     timestamp,
    updated_at     timestamp
);
