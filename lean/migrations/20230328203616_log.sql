-- Add migration script here

create table log_entry
(
    timestamp       timestamp not null,
    server          text      not null,
    transaction_num int       not null,
    username        text      not null,
    log             jsonb     not null
)