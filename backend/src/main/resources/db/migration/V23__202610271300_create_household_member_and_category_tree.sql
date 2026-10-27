create table expense_tracker.household_member
(
    id         bigint primary key,
    name       varchar not null unique,
    created_at timestamp,
    updated_at timestamp
);

create table expense_tracker.category
(
    id         bigint primary key,
    name       varchar not null,
    parent_id  bigint references expense_tracker.category (id),
    unit       varchar,
    created_at timestamp,
    updated_at timestamp
);

-- category names are unique among siblings (case-insensitive)
create unique index category_name_per_parent_idx
    on expense_tracker.category (coalesce(parent_id, 0), lower(name));

alter table expense_tracker.expense
    drop column category,
    add column category_id    bigint references expense_tracker.category (id),
    add column member_id      bigint references expense_tracker.household_member (id),
    add column payment_source varchar,
    add column usage_amount   decimal(12, 3);

alter table expense_tracker.income
    drop column category,
    add column member_id    bigint references expense_tracker.household_member (id),
    add column deposit_type varchar not null default 'MONTHLY';

-- starter categories (the user can change them freely in the app)
do
$$
    declare
        entertainment_id bigint := nextval('public.base_seq');
        home_id          bigint := nextval('public.base_seq');
        bills_id         bigint := nextval('public.base_seq');
        utilities_id     bigint := nextval('public.base_seq');
    begin
        insert into expense_tracker.category (id, name, parent_id, unit, created_at, updated_at)
        values (entertainment_id, 'Rozrywka', null, null, now(), now()),
               (home_id, 'Zakupy domowe', null, null, now(), now()),
               (bills_id, 'Opłaty', null, null, now(), now()),
               (nextval('public.base_seq'), 'Jedzenie', home_id, null, now(), now()),
               (nextval('public.base_seq'), 'Wyposażenie domu', home_id, null, now(), now()),
               (nextval('public.base_seq'), 'Kredyt', bills_id, null, now(), now()),
               (nextval('public.base_seq'), 'Czynsz', bills_id, null, now(), now()),
               (utilities_id, 'Media', bills_id, null, now(), now()),
               (nextval('public.base_seq'), 'Prąd', utilities_id, 'kWh', now(), now()),
               (nextval('public.base_seq'), 'Woda', utilities_id, 'm3', now(), now()),
               (nextval('public.base_seq'), 'Internet', utilities_id, null, now(), now());
    end
$$;
