-- Add migration script here
create table queued_buy
(
    user_id        text references trader (user_id) primary key,
    stock_symbol   text  not null,
    quoted_price   float not null,
    amount_dollars float not null
)