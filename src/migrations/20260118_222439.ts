import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('it', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'staff');
  CREATE TYPE "public"."enum_services_category" AS ENUM('haircut', 'beard', 'styling', 'treatment', 'package');
  CREATE TYPE "public"."enum_appointments_preferred_language" AS ENUM('it', 'en');
  CREATE TYPE "public"."enum_appointments_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'noshow');
  CREATE TYPE "public"."enum_opening_hours_day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_gallery_category" AS ENUM('haircut', 'beard', 'styling', 'before-after', 'shop');
  CREATE TYPE "public"."enum_reviews_source" AS ENUM('google', 'facebook', 'instagram', 'website');
  CREATE TYPE "public"."enum_contact_submissions_subject" AS ENUM('info', 'booking', 'collaboration', 'complaint', 'other');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'read', 'replied', 'archived');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'staff' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"duration" numeric DEFAULT 30 NOT NULL,
  	"category" "enum_services_category" NOT NULL,
  	"image_id" integer,
  	"icon" varchar,
  	"featured" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"short_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "barbers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"photo_id" integer,
  	"experience" numeric,
  	"availability_monday" boolean DEFAULT false,
  	"availability_tuesday" boolean DEFAULT true,
  	"availability_wednesday" boolean DEFAULT true,
  	"availability_thursday" boolean DEFAULT true,
  	"availability_friday" boolean DEFAULT true,
  	"availability_saturday" boolean DEFAULT true,
  	"availability_sunday" boolean DEFAULT false,
  	"instagram" varchar,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "barbers_locales" (
  	"role" varchar DEFAULT 'Barbiere',
  	"bio" jsonb,
  	"short_bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "barbers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "appointments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_name" varchar NOT NULL,
  	"client_email" varchar NOT NULL,
  	"client_phone" varchar NOT NULL,
  	"preferred_language" "enum_appointments_preferred_language" DEFAULT 'it',
  	"service_id" integer NOT NULL,
  	"barber_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time" varchar NOT NULL,
  	"status" "enum_appointments_status" DEFAULT 'pending' NOT NULL,
  	"notes" varchar,
  	"confirmation_sent" boolean DEFAULT false,
  	"reminder_sent" boolean DEFAULT false,
  	"cancellation_token" varchar,
  	"cancelled_at" timestamp(3) with time zone,
  	"cancellation_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "opening_hours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"day_of_week" "enum_opening_hours_day_of_week" NOT NULL,
  	"is_closed" boolean DEFAULT false,
  	"open_time" varchar DEFAULT '09:00',
  	"close_time" varchar DEFAULT '19:30',
  	"break_start" varchar,
  	"break_end" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"category" "enum_gallery_category" NOT NULL,
  	"barber_id" integer,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar NOT NULL,
  	"rating" numeric DEFAULT 5 NOT NULL,
  	"service_id" integer,
  	"barber_id" integer,
  	"source" "enum_reviews_source" DEFAULT 'google',
  	"featured" boolean DEFAULT false,
  	"verified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"subject" "enum_contact_submissions_subject" DEFAULT 'info',
  	"message" varchar NOT NULL,
  	"status" "enum_contact_submissions_status" DEFAULT 'new',
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"services_id" integer,
  	"barbers_id" integer,
  	"appointments_id" integer,
  	"opening_hours_id" integer,
  	"gallery_id" integer,
  	"reviews_id" integer,
  	"contact_submissions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "barbers" ADD CONSTRAINT "barbers_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "barbers_locales" ADD CONSTRAINT "barbers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "barbers_rels" ADD CONSTRAINT "barbers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "barbers_rels" ADD CONSTRAINT "barbers_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_locales" ADD CONSTRAINT "gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_locales" ADD CONSTRAINT "reviews_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_barbers_fk" FOREIGN KEY ("barbers_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_appointments_fk" FOREIGN KEY ("appointments_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opening_hours_fk" FOREIGN KEY ("opening_hours_id") REFERENCES "public"."opening_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "barbers_slug_idx" ON "barbers" USING btree ("slug");
  CREATE INDEX "barbers_photo_idx" ON "barbers" USING btree ("photo_id");
  CREATE INDEX "barbers_updated_at_idx" ON "barbers" USING btree ("updated_at");
  CREATE INDEX "barbers_created_at_idx" ON "barbers" USING btree ("created_at");
  CREATE UNIQUE INDEX "barbers_locales_locale_parent_id_unique" ON "barbers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "barbers_rels_order_idx" ON "barbers_rels" USING btree ("order");
  CREATE INDEX "barbers_rels_parent_idx" ON "barbers_rels" USING btree ("parent_id");
  CREATE INDEX "barbers_rels_path_idx" ON "barbers_rels" USING btree ("path");
  CREATE INDEX "barbers_rels_services_id_idx" ON "barbers_rels" USING btree ("services_id");
  CREATE INDEX "appointments_service_idx" ON "appointments" USING btree ("service_id");
  CREATE INDEX "appointments_barber_idx" ON "appointments" USING btree ("barber_id");
  CREATE INDEX "appointments_updated_at_idx" ON "appointments" USING btree ("updated_at");
  CREATE INDEX "appointments_created_at_idx" ON "appointments" USING btree ("created_at");
  CREATE UNIQUE INDEX "opening_hours_day_of_week_idx" ON "opening_hours" USING btree ("day_of_week");
  CREATE INDEX "opening_hours_updated_at_idx" ON "opening_hours" USING btree ("updated_at");
  CREATE INDEX "opening_hours_created_at_idx" ON "opening_hours" USING btree ("created_at");
  CREATE INDEX "gallery_image_idx" ON "gallery" USING btree ("image_id");
  CREATE INDEX "gallery_barber_idx" ON "gallery" USING btree ("barber_id");
  CREATE INDEX "gallery_updated_at_idx" ON "gallery" USING btree ("updated_at");
  CREATE INDEX "gallery_created_at_idx" ON "gallery" USING btree ("created_at");
  CREATE UNIQUE INDEX "gallery_locales_locale_parent_id_unique" ON "gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reviews_service_idx" ON "reviews" USING btree ("service_id");
  CREATE INDEX "reviews_barber_idx" ON "reviews" USING btree ("barber_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE UNIQUE INDEX "reviews_locales_locale_parent_id_unique" ON "reviews_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_barbers_id_idx" ON "payload_locked_documents_rels" USING btree ("barbers_id");
  CREATE INDEX "payload_locked_documents_rels_appointments_id_idx" ON "payload_locked_documents_rels" USING btree ("appointments_id");
  CREATE INDEX "payload_locked_documents_rels_opening_hours_id_idx" ON "payload_locked_documents_rels" USING btree ("opening_hours_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "barbers" CASCADE;
  DROP TABLE "barbers_locales" CASCADE;
  DROP TABLE "barbers_rels" CASCADE;
  DROP TABLE "appointments" CASCADE;
  DROP TABLE "opening_hours" CASCADE;
  DROP TABLE "gallery" CASCADE;
  DROP TABLE "gallery_locales" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_locales" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_services_category";
  DROP TYPE "public"."enum_appointments_preferred_language";
  DROP TYPE "public"."enum_appointments_status";
  DROP TYPE "public"."enum_opening_hours_day_of_week";
  DROP TYPE "public"."enum_gallery_category";
  DROP TYPE "public"."enum_reviews_source";
  DROP TYPE "public"."enum_contact_submissions_subject";
  DROP TYPE "public"."enum_contact_submissions_status";`)
}
