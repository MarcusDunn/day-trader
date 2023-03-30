-- Add migration script here
create table sell_trigger
(
    owner_id       text  not null,
    stock_symbol   text  not null,
    amount_stock float not null,
    trigger_price  float,
    primary key (owner_id, stock_symbol)
)