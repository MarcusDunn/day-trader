-- Add migration script here
alter table queued_buy
    add column time_created timestamp not null default now()