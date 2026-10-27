-- Consumption that is not an expense of its own (it is part of the rent): cold water, hot water, heating.
-- Electricity is added together with its monthly expense, so it is not stored here.
create table expense_tracker.usage_reading
(
    id         bigint primary key,
    utility    varchar        not null,
    year       int            not null,
    month      int            not null,
    amount     decimal(12, 3) not null,
    created_at timestamp,
    updated_at timestamp,
    unique (utility, year, month)
);
