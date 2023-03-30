-- Add migration script here
create table stock
(
    owner_id     text  not null,
    stock_symbol text  not null,
    amount       float not null,
    primary key (owner_id, stock_symbol)
)