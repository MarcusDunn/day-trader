-- Add migration script here
alter table queued_sell
    add column time_created timestamp not null default now()