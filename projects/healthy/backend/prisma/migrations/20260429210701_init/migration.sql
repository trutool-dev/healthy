-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending_verification', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "VerificationCodeType" AS ENUM ('email_verification', 'password_reset');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('ectomorph', 'mesomorph', 'endomorph');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- CreateEnum
CREATE TYPE "UserGoal" AS ENUM ('lose_weight', 'gain_muscle', 'maintain', 'general_health');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('office', 'physical', 'standing', 'mixed');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('morning', 'afternoon', 'night');

-- CreateEnum
CREATE TYPE "SleepQuality" AS ENUM ('good', 'regular', 'bad');

-- CreateEnum
CREATE TYPE "AlcoholLevel" AS ENUM ('never', 'occasional', 'frequent');

-- CreateEnum
CREATE TYPE "HomeEquipment" AS ENUM ('none', 'dumbbells', 'bands', 'machines', 'full');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('injury', 'disease', 'medication');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('omnivore', 'vegetarian', 'vegan', 'gluten_free', 'lactose_free');

-- CreateEnum
CREATE TYPE "EatsOutFrequency" AS ENUM ('never', 'sometimes', 'often', 'always');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('allergy', 'intolerance', 'dislike');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('mild', 'moderate', 'severe');

-- CreateEnum
CREATE TYPE "MotivationType" AS ENUM ('health', 'aesthetics', 'performance', 'mental_wellbeing');

-- CreateEnum
CREATE TYPE "TrackingPreference" AS ENUM ('detailed', 'basic', 'results_only');

-- CreateEnum
CREATE TYPE "OnboardingCategory" AS ENUM ('lifestyle', 'training', 'nutrition', 'health', 'motivation');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('nutrition', 'training', 'combined');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('active', 'completed', 'paused');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('scheduled', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('scheduled', 'completed', 'skipped');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "password_hash" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VerificationCodeType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "weight_kg" DECIMAL(5,2),
    "height_cm" DECIMAL(5,2),
    "body_type" "BodyType",
    "activity_level" "ActivityLevel",
    "goal" "UserGoal",
    "daily_calories_target" INTEGER,
    "daily_protein_target" INTEGER,
    "daily_carbs_target" INTEGER,
    "daily_fat_target" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifestyle_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profession" TEXT,
    "work_type" "WorkType",
    "work_hours_per_day" INTEGER,
    "stress_level" INTEGER,
    "usual_schedule" "ScheduleType",
    "sleep_hours_usual" DECIMAL(4,2),
    "sleep_quality" "SleepQuality",
    "alcohol_consumption" "AlcoholLevel",
    "smoker" BOOLEAN NOT NULL DEFAULT false,
    "daily_water_glasses" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lifestyle_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "available_days_per_week" INTEGER,
    "max_session_duration_minutes" INTEGER,
    "preferred_training_time" "ScheduleType",
    "has_gym_access" BOOLEAN NOT NULL DEFAULT false,
    "home_equipment" "HomeEquipment" NOT NULL DEFAULT 'none',
    "experience_level" "ExperienceLevel",
    "injuries_or_limitations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_conditions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "condition_name" TEXT NOT NULL,
    "condition_type" "ConditionType" NOT NULL,
    "affects_training" BOOLEAN NOT NULL DEFAULT false,
    "affects_nutrition" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "diet_type" "DietType",
    "meals_per_day_preferred" INTEGER,
    "cooks_at_home" BOOLEAN NOT NULL DEFAULT true,
    "eats_out_frequency" "EatsOutFrequency",
    "monthly_food_budget_range" "BudgetRange",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_restrictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "restriction_type" "RestrictionType" NOT NULL,
    "food_name" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motivation_profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "main_motivation" "MotivationType",
    "previous_attempts" BOOLEAN NOT NULL DEFAULT false,
    "previous_attempts_notes" TEXT,
    "tracking_preference" "TrackingPreference",
    "has_support_network" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motivation_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_answers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_key" TEXT NOT NULL,
    "answer_value" TEXT NOT NULL,
    "question_category" "OnboardingCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "PlanStatus" NOT NULL DEFAULT 'active',
    "generated_by_ai" BOOLEAN NOT NULL DEFAULT false,
    "ai_prompt_used" TEXT,
    "ai_model_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "calories_burned" INTEGER,
    "notes" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'scheduled',

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscle_group" TEXT NOT NULL,
    "equipment_needed" TEXT,
    "difficulty" "ExperienceLevel" NOT NULL,
    "instructions" TEXT,
    "video_url" TEXT,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_exercises" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "weight_kg" DECIMAL(6,2),
    "rest_seconds" INTEGER,
    "order_index" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "calories" INTEGER,
    "protein_g" DECIMAL(6,2),
    "carbs_g" DECIMAL(6,2),
    "fat_g" DECIMAL(6,2),
    "status" "MealStatus" NOT NULL DEFAULT 'scheduled',

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "calories_per_100g" DECIMAL(7,2) NOT NULL,
    "protein_per_100g" DECIMAL(6,2) NOT NULL,
    "carbs_per_100g" DECIMAL(6,2) NOT NULL,
    "fat_per_100g" DECIMAL(6,2) NOT NULL,
    "barcode" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_foods" (
    "id" TEXT NOT NULL,
    "meal_id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "quantity_g" DECIMAL(7,2) NOT NULL,

    CONSTRAINT "meal_foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL,
    "weight_kg" DECIMAL(5,2),
    "body_fat_percentage" DECIMAL(5,2),
    "muscle_mass_kg" DECIMAL(5,2),
    "waist_cm" DECIMAL(5,2),
    "hip_cm" DECIMAL(5,2),
    "chest_cm" DECIMAL(5,2),
    "notes" TEXT,
    "photo_url" TEXT,

    CONSTRAINT "progress_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL,
    "water_ml" INTEGER,
    "sleep_hours" DECIMAL(4,2),
    "sleep_quality" INTEGER,
    "energy_level" INTEGER,
    "mood" INTEGER,
    "steps" INTEGER,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "verification_codes_user_id_idx" ON "verification_codes"("user_id");

-- CreateIndex
CREATE INDEX "verification_codes_email_idx" ON "verification_codes"("email");

-- CreateIndex
CREATE INDEX "verification_codes_code_idx" ON "verification_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_refresh_token_key" ON "auth_sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "auth_sessions_refresh_token_idx" ON "auth_sessions"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "lifestyle_profiles_user_id_key" ON "lifestyle_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_preferences_user_id_key" ON "training_preferences"("user_id");

-- CreateIndex
CREATE INDEX "health_conditions_user_id_idx" ON "health_conditions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_preferences_user_id_key" ON "nutrition_preferences"("user_id");

-- CreateIndex
CREATE INDEX "food_restrictions_user_id_idx" ON "food_restrictions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "motivation_profile_user_id_key" ON "motivation_profile"("user_id");

-- CreateIndex
CREATE INDEX "onboarding_answers_user_id_idx" ON "onboarding_answers"("user_id");

-- CreateIndex
CREATE INDEX "onboarding_answers_question_category_idx" ON "onboarding_answers"("question_category");

-- CreateIndex
CREATE INDEX "plans_user_id_idx" ON "plans"("user_id");

-- CreateIndex
CREATE INDEX "plans_status_idx" ON "plans"("status");

-- CreateIndex
CREATE INDEX "training_sessions_plan_id_idx" ON "training_sessions"("plan_id");

-- CreateIndex
CREATE INDEX "training_sessions_user_id_idx" ON "training_sessions"("user_id");

-- CreateIndex
CREATE INDEX "training_sessions_scheduled_date_idx" ON "training_sessions"("scheduled_date");

-- CreateIndex
CREATE INDEX "exercises_muscle_group_idx" ON "exercises"("muscle_group");

-- CreateIndex
CREATE INDEX "exercises_difficulty_idx" ON "exercises"("difficulty");

-- CreateIndex
CREATE INDEX "session_exercises_session_id_idx" ON "session_exercises"("session_id");

-- CreateIndex
CREATE INDEX "session_exercises_exercise_id_idx" ON "session_exercises"("exercise_id");

-- CreateIndex
CREATE INDEX "meals_plan_id_idx" ON "meals"("plan_id");

-- CreateIndex
CREATE INDEX "meals_user_id_idx" ON "meals"("user_id");

-- CreateIndex
CREATE INDEX "meals_scheduled_date_idx" ON "meals"("scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "foods_barcode_key" ON "foods"("barcode");

-- CreateIndex
CREATE INDEX "foods_name_idx" ON "foods"("name");

-- CreateIndex
CREATE INDEX "foods_barcode_idx" ON "foods"("barcode");

-- CreateIndex
CREATE INDEX "meal_foods_meal_id_idx" ON "meal_foods"("meal_id");

-- CreateIndex
CREATE INDEX "meal_foods_food_id_idx" ON "meal_foods"("food_id");

-- CreateIndex
CREATE INDEX "progress_logs_user_id_idx" ON "progress_logs"("user_id");

-- CreateIndex
CREATE INDEX "progress_logs_log_date_idx" ON "progress_logs"("log_date");

-- CreateIndex
CREATE INDEX "daily_logs_user_id_idx" ON "daily_logs"("user_id");

-- CreateIndex
CREATE INDEX "daily_logs_log_date_idx" ON "daily_logs"("log_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_user_id_log_date_key" ON "daily_logs"("user_id", "log_date");

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifestyle_profiles" ADD CONSTRAINT "lifestyle_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_preferences" ADD CONSTRAINT "training_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_conditions" ADD CONSTRAINT "health_conditions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_preferences" ADD CONSTRAINT "nutrition_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_restrictions" ADD CONSTRAINT "food_restrictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motivation_profile" ADD CONSTRAINT "motivation_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_answers" ADD CONSTRAINT "onboarding_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_foods" ADD CONSTRAINT "meal_foods_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_foods" ADD CONSTRAINT "meal_foods_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_logs" ADD CONSTRAINT "progress_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
