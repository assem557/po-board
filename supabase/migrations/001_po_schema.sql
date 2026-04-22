-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin','ops','partnership','finance','pricing','tech')),
  team text not null,
  created_at timestamptz default now()
);

-- Dealers
create table if not exists dealers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  city text,
  status text default 'active',
  has_working_hours boolean default false,
  has_branches boolean default false,
  created_at timestamptz default now()
);

-- Purchase Orders
create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null,
  dealer_id uuid references dealers(id),
  dealer_name text not null,
  current_stage int default 1 check (current_stage between 1 and 8),
  status text default 'active' check (status in ('active','complete','cancelled')),
  delivery_date date,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- Vehicle batches per PO
create table if not exists vehicle_batches (
  id uuid primary key default gen_random_uuid(),
  po_id uuid references purchase_orders(id) on delete cascade,
  color text not null,
  count int not null default 1,
  city text not null,
  vin text,
  plate text,
  created_at timestamptz default now()
);

-- Stage completions (audit trail)
create table if not exists po_stage_completions (
  id uuid primary key default gen_random_uuid(),
  po_id uuid references purchase_orders(id) on delete cascade,
  stage int not null,
  completed_by_name text not null,
  completed_by_role text not null,
  notes text,
  document_url text,
  document_name text,
  extra_data jsonb,
  completed_at timestamptz default now()
);

-- Comments thread
create table if not exists po_comments (
  id uuid primary key default gen_random_uuid(),
  po_id uuid references purchase_orders(id) on delete cascade,
  author_name text not null,
  author_role text not null,
  body text not null,
  attachments jsonb default '[]',
  created_at timestamptz default now()
);

-- Seed demo dealers
insert into dealers (id, name, type, city, has_working_hours, has_branches) values
  ('11111111-0000-0000-0000-000000000001', 'Green Motion', 'STO', 'Riyadh', true, true),
  ('11111111-0000-0000-0000-000000000002', 'Hanko Motors', 'STO', 'Jeddah', false, false),
  ('11111111-0000-0000-0000-000000000003', 'AutoDeal KSA', 'STS', 'Riyadh', true, true)
on conflict do nothing;

-- Seed demo purchase orders
insert into purchase_orders (id, po_number, dealer_id, dealer_name, current_stage, status, delivery_date, notes) values
  ('22222222-0000-0000-0000-000000000001', 'PO-2024-001', '11111111-0000-0000-0000-000000000001', 'Green Motion', 5, 'active', '2024-05-15', 'Urgent - Q2 batch'),
  ('22222222-0000-0000-0000-000000000002', 'PO-2024-002', '11111111-0000-0000-0000-000000000002', 'Hanko Motors', 2, 'active', '2024-05-20', 'New dealer onboarding'),
  ('22222222-0000-0000-0000-000000000003', 'PO-2024-003', '11111111-0000-0000-0000-000000000003', 'AutoDeal KSA', 8, 'complete', '2024-04-30', null)
on conflict do nothing;

-- Seed demo vehicles
insert into vehicle_batches (po_id, color, count, city) values
  ('22222222-0000-0000-0000-000000000001', 'White', 9, 'Jeddah'),
  ('22222222-0000-0000-0000-000000000001', 'Black', 1, 'Riyadh'),
  ('22222222-0000-0000-0000-000000000002', 'Silver', 15, 'Jeddah'),
  ('22222222-0000-0000-0000-000000000003', 'White', 5, 'Riyadh'),
  ('22222222-0000-0000-0000-000000000003', 'Red', 3, 'Jeddah')
on conflict do nothing;
