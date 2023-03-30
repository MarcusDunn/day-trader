-- Add migration script here
create table buy_trigger
(
    owner_id       text  not null,
    stock_symbol   text  not null,
    amount_dollars float not null,
    trigger_price  float,
    primary key (owner_id, stock_symbol)
)