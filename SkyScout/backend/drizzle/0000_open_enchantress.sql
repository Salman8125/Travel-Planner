CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."cabin" AS ENUM('ECONOMY', 'BUSINESS', 'FIRST');--> statement-breakpoint
CREATE TYPE "public"."flight_status" AS ENUM('SCHEDULED', 'DELAYED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."passenger_type" AS ENUM('ADULT', 'CHILD', 'INFANT');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aircraft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration" text NOT NULL,
	"model" text NOT NULL,
	"seat_capacity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"iata_code" varchar(2) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "airlines_iata_format" CHECK (char_length("airlines"."iata_code") = 2 and "airlines"."iata_code" = upper("airlines"."iata_code"))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"iata_code" varchar(3) NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"country" varchar(2) NOT NULL,
	"timezone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "airports_iata_format" CHECK (char_length("airports"."iata_code") = 3 and "airports"."iata_code" = upper("airports"."iata_code"))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(6) NOT NULL,
	"user_id" uuid NOT NULL,
	"flight_id" uuid NOT NULL,
	"cabin" "cabin" NOT NULL,
	"status" "booking_status" DEFAULT 'PENDING' NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"contact_email" text NOT NULL,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	CONSTRAINT "bookings_total_nonneg" CHECK ("bookings"."total_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cabin_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_id" uuid NOT NULL,
	"cabin" "cabin" NOT NULL,
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cabin_available_nonneg" CHECK ("cabin_inventory"."available_seats" >= 0),
	CONSTRAINT "cabin_available_lte_total" CHECK ("cabin_inventory"."available_seats" <= "cabin_inventory"."total_seats"),
	CONSTRAINT "cabin_base_price_nonneg" CHECK ("cabin_inventory"."base_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_number" varchar(16) NOT NULL,
	"airline_id" uuid NOT NULL,
	"origin_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"scheduled_departure" timestamp with time zone NOT NULL,
	"scheduled_arrival" timestamp with time zone NOT NULL,
	"status" "flight_status" DEFAULT 'SCHEDULED' NOT NULL,
	"aircraft_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flights_origin_ne_destination" CHECK ("flights"."origin_id" <> "flights"."destination_id"),
	CONSTRAINT "flights_arrival_after_departure" CHECK ("flights"."scheduled_arrival" > "flights"."scheduled_departure")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "passengers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"type" "passenger_type" NOT NULL,
	"passport_number" text,
	"seat_number" text,
	CONSTRAINT "passengers_dob_past" CHECK ("passengers"."date_of_birth" < now())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cabin_inventory" ADD CONSTRAINT "cabin_inventory_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flights" ADD CONSTRAINT "flights_airline_id_airlines_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airlines"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flights" ADD CONSTRAINT "flights_origin_id_airports_id_fk" FOREIGN KEY ("origin_id") REFERENCES "public"."airports"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flights" ADD CONSTRAINT "flights_destination_id_airports_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."airports"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flights" ADD CONSTRAINT "flights_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "passengers" ADD CONSTRAINT "passengers_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_aircraft_registration" ON "aircraft" USING btree ("registration");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_airlines_iata" ON "airlines" USING btree ("iata_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_airports_iata" ON "airports" USING btree ("iata_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_bookings_reference" ON "bookings" USING btree ("reference");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_bookings_idempotency_key" ON "bookings" USING btree ("idempotency_key") WHERE "bookings"."idempotency_key" is not null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_user" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_flight" ON "bookings" USING btree ("flight_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_cabin_inventory_flight_cabin" ON "cabin_inventory" USING btree ("flight_id","cabin");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_flights_route_dep" ON "flights" USING btree ("origin_id","destination_id","scheduled_departure");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_passengers_booking" ON "passengers" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_users_email" ON "users" USING btree ("email");