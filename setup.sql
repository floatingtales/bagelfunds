CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" text,
  "email" text,
  "password" text,
  "phone_num" text,
  "profile_url" text,
  "twitter_handle" text,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "cycle" (
  "id" SERIAL PRIMARY KEY,
  "cycle_name" text,
  "host_id" integer,
  "start_date" date,
  "session_freq" interval,
  "session_payment" integer,
  "has_started" boolean,
  "has_ended" boolean,
  "end_date" date,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "invites" (
  "id" SERIAL PRIMARY KEY,
  "cycle_id" integer,
  "invitee_id" integer,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "user_cycle" (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer,
  "cycle_id" integer,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "sessions" (
  "id" SERIAL PRIMARY KEY,
  "cycle_id" integer,
  "due_date" date,
  "all_payments_received" boolean,
  "session_u_c_winner" integer,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "payments" (
  "id" SERIAL PRIMARY KEY,
  "u_c_id" integer,
  "session_id" integer,
  "has_paid" boolean,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);