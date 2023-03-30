-- Add migration script here
alter table trader
    add constraint trader_balance_check check (balance >= 0)