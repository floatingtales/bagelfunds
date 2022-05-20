CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "email" text,
  "password" text,
  "phone_num" text,
  "profile_url" text,
  "twitter_handle" text,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "cycle" (
  "id" SERIAL PRIMARY KEY,
  "host_id" integer,
  "start_date" datetime,
  "pull_freq" text,
  "amt_per_pull" integer,
  "cycle_type" text,
  "payment_times" integer,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "users_cycle" (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer,
  "cycle_id" integer,
  "has_received" boolean,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE "payments_cycle" (
  "id" SERIAL PRIMARY KEY,
  "u_c_id" integer,
  "has_paid" boolean,
  "due_date" datetime,
  "payment_number" integer,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE "cycle" ADD FOREIGN KEY ("host_id") REFERENCES "users" ("id");

ALTER TABLE "users_cycle" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "users_cycle" ADD FOREIGN KEY ("cycle_id") REFERENCES "cycle" ("id");

ALTER TABLE "payments_cycle" ADD FOREIGN KEY ("u_c_id") REFERENCES "users_cycle" ("id");
