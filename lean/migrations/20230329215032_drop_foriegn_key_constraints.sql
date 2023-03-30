-- Add migration script here
alter table queued_sell drop constraint queued_sell_user_id_fkey;
alter table queued_buy drop constraint queued_buy_user_id_fkey;
