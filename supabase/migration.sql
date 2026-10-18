-- SevaBridge schema, constraints, and access rules.
-- Review this file before running it in the Supabase SQL editor.
-- It does not contain keys or donor data.
--
-- security definer functions below bypass row security.
-- They return only totals, or a boolean ownership check.
-- They must not be changed to return donor name, email, phone, or message.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users (id),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  public_contact_email text check (
    public_contact_email is null or char_length(btrim(public_contact_email)) between 3 and 160
  ),
  logo_url text check (logo_url is null or char_length(logo_url) <= 500),
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  summary text not null check (char_length(btrim(summary)) between 1 and 160),
  description text not null check (char_length(btrim(description)) between 1 and 5000),
  category text not null check (category in ('education', 'essentials', 'healthcare', 'community')),
  campaign_mode text not null check (campaign_mode in ('items', 'money', 'both')),
  cover_image_url text check (cover_image_url is null or char_length(cover_image_url) <= 500),
  money_goal numeric(12, 2),
  deadline date,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_money_goal_matches_mode check (
    (
      campaign_mode in ('money', 'both')
      and money_goal is not null
      and money_goal > 0
    )
    or (
      campaign_mode = 'items'
      and money_goal is null
    )
  )
);

create table public.campaign_item_needs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  item_name text not null check (char_length(btrim(item_name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 500),
  quantity_needed integer not null check (quantity_needed > 0),
  unit text not null check (char_length(btrim(unit)) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete restrict,
  commitment_type text not null check (commitment_type in ('item', 'money')),
  item_need_id uuid references public.campaign_item_needs (id) on delete restrict,
  donor_name text not null check (char_length(btrim(donor_name)) between 1 and 120),
  donor_email text,
  donor_phone text,
  amount numeric(12, 2),
  quantity integer,
  message text check (message is null or char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  constraint commitments_contact check (
    nullif(btrim(donor_email), '') is not null
    or nullif(btrim(donor_phone), '') is not null
  ),
  constraint commitments_contact_length check (
    (donor_email is null or char_length(btrim(donor_email)) between 3 and 160)
    and (donor_phone is null or char_length(btrim(donor_phone)) between 7 and 20)
  ),
  constraint commitments_shape check (
    (
      commitment_type = 'money'
      and amount is not null
      and amount > 0
      and item_need_id is null
      and quantity is null
    )
    or (
      commitment_type = 'item'
      and item_need_id is not null
      and quantity is not null
      and quantity > 0
      and amount is null
    )
  )
);

create table public.campaign_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  image_url text check (image_url is null or char_length(image_url) <= 500),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index campaigns_organization_id_idx on public.campaigns (organization_id);
create index campaigns_status_idx on public.campaigns (status);
create index campaigns_category_idx on public.campaigns (category);
create index campaign_item_needs_campaign_id_idx on public.campaign_item_needs (campaign_id);
create index commitments_campaign_id_idx on public.commitments (campaign_id);
create index commitments_campaign_status_idx on public.commitments (campaign_id, status);
create index commitments_item_need_id_idx on public.commitments (item_need_id);
create index campaign_updates_campaign_published_idx on public.campaign_updates (campaign_id, published_at desc);

-- ---------------------------------------------------------------------------
-- Ownership helper. security definer so policies can check owner_user_id
-- without granting that column to the browser roles.
-- ---------------------------------------------------------------------------

create function public.is_org_owner(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizations
    where id = org_id
      and owner_user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row checks that constraints cannot express (they cannot query other tables).
-- ---------------------------------------------------------------------------

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.reject_invalid_commitment()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  camp public.campaigns%rowtype;
  need_campaign uuid;
begin
  if tg_op = 'INSERT' and (new.status is distinct from 'pending' or new.fulfilled_at is not null) then
    raise exception 'New pledges must start as pending';
  end if;

  select * into camp from public.campaigns where id = new.campaign_id;
  if not found then
    raise exception 'Campaign not found';
  end if;

  if tg_op = 'INSERT' and camp.status is distinct from 'active' then
    raise exception 'This campaign is not accepting pledges';
  end if;

  if new.commitment_type = 'money' and camp.campaign_mode not in ('money', 'both') then
    raise exception 'This campaign does not accept money pledges';
  end if;

  if new.commitment_type = 'item' and camp.campaign_mode not in ('items', 'both') then
    raise exception 'This campaign does not accept item pledges';
  end if;

  if new.commitment_type = 'item' then
    select campaign_id into need_campaign
    from public.campaign_item_needs
    where id = new.item_need_id;

    if need_campaign is null or need_campaign is distinct from new.campaign_id then
      raise exception 'That item is not part of this campaign';
    end if;
  end if;

  return new;
end;
$$;

create function public.sync_fulfilled_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.fulfilled_at = null;
    return new;
  end if;

  if new.status = 'fulfilled' then
    if old.status is distinct from 'fulfilled' then
      new.fulfilled_at = now();
    else
      new.fulfilled_at = old.fulfilled_at;
    end if;
  else
    new.fulfilled_at = null;
  end if;

  return new;
end;
$$;

create function public.publish_campaign_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.created_by is distinct from auth.uid() then
    raise exception 'Update author must be the signed-in user';
  end if;

  new.published_at = now();
  return new;
end;
$$;

create trigger campaigns_touch_updated_at
before update on public.campaigns
for each row execute function public.touch_updated_at();

create trigger campaign_item_needs_touch_updated_at
before update on public.campaign_item_needs
for each row execute function public.touch_updated_at();

create trigger commitments_touch_updated_at
before update on public.commitments
for each row execute function public.touch_updated_at();

create trigger commitments_reject_invalid
before insert or update on public.commitments
for each row execute function public.reject_invalid_commitment();

create trigger commitments_sync_fulfilled_at
before insert or update on public.commitments
for each row execute function public.sync_fulfilled_at();

create trigger campaign_updates_publish
before insert on public.campaign_updates
for each row execute function public.publish_campaign_update();

-- ---------------------------------------------------------------------------
-- Public totals. security definer so visitors never select commitment rows.
-- Draft and archived campaigns are omitted, same as an unknown id.
-- ---------------------------------------------------------------------------

create function public.campaign_public_summaries(p_ids uuid[])
returns table (
  campaign_id uuid,
  money_pledged numeric,
  money_received numeric,
  items_needed integer,
  items_pledged integer,
  items_received integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_ids is null or cardinality(p_ids) = 0 then
    return;
  end if;

  if cardinality(p_ids) > 100 then
    raise exception 'Pass at most 100 campaign ids';
  end if;

  return query
  select
    c.id,
    coalesce(sum(m.amount) filter (where m.commitment_type = 'money' and m.status <> 'cancelled'), 0),
    coalesce(sum(m.amount) filter (where m.commitment_type = 'money' and m.status = 'fulfilled'), 0),
    coalesce((
      select sum(n.quantity_needed)::integer
      from public.campaign_item_needs n
      where n.campaign_id = c.id
    ), 0),
    coalesce(sum(m.quantity) filter (where m.commitment_type = 'item' and m.status <> 'cancelled'), 0)::integer,
    coalesce(sum(m.quantity) filter (where m.commitment_type = 'item' and m.status = 'fulfilled'), 0)::integer
  from public.campaigns c
  left join public.commitments m on m.campaign_id = c.id
  where c.id = any (p_ids)
    and c.status in ('active', 'completed')
  group by c.id;
end;
$$;

create function public.item_need_public_progress(p_campaign_id uuid)
returns table (
  item_need_id uuid,
  quantity_pledged integer,
  quantity_received integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    n.id,
    coalesce(sum(m.quantity) filter (where m.status <> 'cancelled'), 0)::integer,
    coalesce(sum(m.quantity) filter (where m.status = 'fulfilled'), 0)::integer
  from public.campaign_item_needs n
  left join public.commitments m
    on m.item_need_id = n.id
   and m.commitment_type = 'item'
  where n.campaign_id = p_campaign_id
    and exists (
      select 1
      from public.campaigns c
      where c.id = p_campaign_id
        and c.status in ('active', 'completed')
    )
  group by n.id;
$$;

-- ---------------------------------------------------------------------------
-- Privileges. Revoke the broad defaults, then grant the narrow set.
-- owner_user_id is not selectable. Anon cannot read commitment rows.
-- Anon cannot choose status or fulfilled_at on insert; both default.
-- ---------------------------------------------------------------------------

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.campaigns from anon, authenticated;
revoke all on table public.campaign_item_needs from anon, authenticated;
revoke all on table public.commitments from anon, authenticated;
revoke all on table public.campaign_updates from anon, authenticated;

grant select (
  id, name, description, public_contact_email, logo_url, created_at
) on public.organizations to anon, authenticated;

grant update (
  name, description, public_contact_email, logo_url
) on public.organizations to authenticated;

grant select on public.campaigns to anon, authenticated;
grant insert, update on public.campaigns to authenticated;

grant select on public.campaign_item_needs to anon, authenticated;
grant insert, update, delete on public.campaign_item_needs to authenticated;

grant insert (
  campaign_id, commitment_type, item_need_id, donor_name, donor_email, donor_phone, amount, quantity, message
) on public.commitments to anon;

-- Anon still has no select policy, so these columns cannot be listed.
-- The insert check has to read status and fulfilled_at, which requires the column privilege.
grant select (
  id, campaign_id, commitment_type, item_need_id, amount, quantity, status, fulfilled_at, created_at, updated_at
) on public.commitments to anon;

grant select on public.commitments to authenticated;
grant update (status) on public.commitments to authenticated;

grant select on public.campaign_updates to anon, authenticated;
grant insert, update on public.campaign_updates to authenticated;

revoke all on function public.is_org_owner(uuid) from public;
grant execute on function public.is_org_owner(uuid) to authenticated;

revoke all on function public.campaign_public_summaries(uuid[]) from public;
grant execute on function public.campaign_public_summaries(uuid[]) to anon, authenticated;

revoke all on function public.item_need_public_progress(uuid) from public;
grant execute on function public.item_need_public_progress(uuid) to anon, authenticated;

revoke all on function public.touch_updated_at() from public;
revoke all on function public.reject_invalid_commitment() from public;
revoke all on function public.sync_fulfilled_at() from public;
revoke all on function public.publish_campaign_update() from public;
grant execute on function public.touch_updated_at() to anon, authenticated;
grant execute on function public.reject_invalid_commitment() to anon, authenticated;
grant execute on function public.sync_fulfilled_at() to anon, authenticated;
grant execute on function public.publish_campaign_update() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row security
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_item_needs enable row level security;
alter table public.commitments enable row level security;
alter table public.campaign_updates enable row level security;

create policy organizations_select on public.organizations
for select to anon, authenticated
using (true);

create policy organizations_update on public.organizations
for update to authenticated
using (public.is_org_owner(id))
with check (public.is_org_owner(id));

create policy campaigns_select_public on public.campaigns
for select to anon
using (status in ('active', 'completed'));

create policy campaigns_select_member on public.campaigns
for select to authenticated
using (
  status in ('active', 'completed')
  or public.is_org_owner(organization_id)
);

create policy campaigns_insert on public.campaigns
for insert to authenticated
with check (public.is_org_owner(organization_id));

create policy campaigns_update on public.campaigns
for update to authenticated
using (public.is_org_owner(organization_id))
with check (public.is_org_owner(organization_id));

create policy item_needs_select on public.campaign_item_needs
for select to anon, authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
  )
);

create policy item_needs_write on public.campaign_item_needs
for all to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
);

create policy commitments_select on public.commitments
for select to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
);

create policy commitments_insert on public.commitments
for insert to anon
with check (
  status = 'pending'
  and fulfilled_at is null
  and exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and c.status = 'active'
      and (
        (commitment_type = 'money' and c.campaign_mode in ('money', 'both'))
        or (commitment_type = 'item' and c.campaign_mode in ('items', 'both'))
      )
  )
);

create policy commitments_update on public.commitments
for update to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
);

create policy updates_select_public on public.campaign_updates
for select to anon
using (
  published_at is not null
  and exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
  )
);

create policy updates_select_member on public.campaign_updates
for select to authenticated
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and (
        published_at is not null
        or public.is_org_owner(c.organization_id)
      )
  )
);

create policy updates_insert on public.campaign_updates
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
);

create policy updates_update on public.campaign_updates
for update to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and public.is_org_owner(c.organization_id)
  )
);
