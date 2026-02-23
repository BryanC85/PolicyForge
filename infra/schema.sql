-- PolicyForge.ai multi-tenant schema (PostgreSQL + pgvector)
create extension if not exists "uuid-ossp";
create extension if not exists vector;

create schema if not exists app;

-- Helper function used by RLS policies.
create or replace function app.current_org_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_organization_id', true), '')::uuid;
$$;

create table if not exists app.organizations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null unique,
  name text not null,
  industry text,
  employee_count int,
  state_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.roles (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  name text not null check (name in ('owner','admin','manager','employee','auditor')),
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists app.users (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  auth_user_id uuid not null unique,
  role_id uuid not null references app.roles(id),
  email text not null,
  full_name text,
  status text not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists app.documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  uploaded_by uuid not null references app.users(id),
  filename text not null,
  content_type text not null,
  storage_path text not null,
  sha256 text not null,
  pages int,
  status text not null default 'processing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.document_chunks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  document_id uuid not null references app.documents(id) on delete cascade,
  page_number int,
  chunk_index int not null,
  content text not null,
  token_count int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists app.embeddings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  document_chunk_id uuid not null references app.document_chunks(id) on delete cascade,
  embedding vector(1536) not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique (document_chunk_id)
);

create table if not exists app.policy_reviews (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  requested_by uuid not null references app.users(id),
  compliance_score int check (compliance_score between 0 and 100),
  status text not null default 'queued',
  review_json jsonb,
  report_pdf_path text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists app.chat_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  user_id uuid not null references app.users(id),
  question text not null,
  answer text,
  cited_sources jsonb,
  escalated boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app.audit_events (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  actor_user_id uuid references app.users(id),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists app.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null unique,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null default 'trialing',
  current_period_end timestamptz,
  plan text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.usage_metrics (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  metric_date date not null,
  active_employee_users int not null default 0,
  document_storage_bytes bigint not null default 0,
  ai_tokens_used bigint not null default 0,
  compliance_reviews_run int not null default 0,
  created_at timestamptz not null default now(),
  unique (organization_id, metric_date)
);

-- Foreign key to organization table based on required organization_id in all tables.
alter table app.roles add constraint fk_roles_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.users add constraint fk_users_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.documents add constraint fk_docs_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.document_chunks add constraint fk_chunks_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.embeddings add constraint fk_embeddings_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.policy_reviews add constraint fk_reviews_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.chat_logs add constraint fk_chats_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.audit_events add constraint fk_audit_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.subscriptions add constraint fk_subs_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;
alter table app.usage_metrics add constraint fk_usage_org foreign key (organization_id) references app.organizations(organization_id) on delete cascade;

create index if not exists idx_embeddings_vector on app.embeddings using ivfflat (embedding vector_cosine_ops);
create index if not exists idx_chunks_document on app.document_chunks(document_id, chunk_index);
create index if not exists idx_audit_org_created on app.audit_events(organization_id, created_at desc);

-- Enable strict row level security everywhere.
alter table app.organizations enable row level security;
alter table app.roles enable row level security;
alter table app.users enable row level security;
alter table app.documents enable row level security;
alter table app.document_chunks enable row level security;
alter table app.embeddings enable row level security;
alter table app.policy_reviews enable row level security;
alter table app.chat_logs enable row level security;
alter table app.audit_events enable row level security;
alter table app.subscriptions enable row level security;
alter table app.usage_metrics enable row level security;

create policy org_isolation_organizations on app.organizations
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_roles on app.roles
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_users on app.users
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_documents on app.documents
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_document_chunks on app.document_chunks
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_embeddings on app.embeddings
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_policy_reviews on app.policy_reviews
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_chat_logs on app.chat_logs
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_audit_events on app.audit_events
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_subscriptions on app.subscriptions
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

create policy org_isolation_usage_metrics on app.usage_metrics
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());
