-- Add migration script here
create table trader
(
    user_id text primary key not null,
    balance float            not null
)