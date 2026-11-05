-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('hot', 'cold', 'beans');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('requested', 'confirmed', 'declined', 'cancelled');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'hot';

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "status" "ReservationStatus" NOT NULL DEFAULT 'requested',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservations_date_idx" ON "reservations"("date");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- Put the existing starter drinks in the right group, and add the rest of the bean-to-cup menu once.
UPDATE "products" SET "category" = 'cold' WHERE "name" = 'Iced Latte';
INSERT INTO "products" ("id", "name", "description", "price", "category", "image", "sort_order", "featured", "updated_at")
SELECT gen_random_uuid(), v.name, v.description, v.price, v.category::"ProductCategory", v.image, v.sort_order, v.featured, CURRENT_TIMESTAMP
FROM (VALUES
  ('Café Latte', 'Silky steamed milk poured over a double shot.', 4.50, 'hot', 'images/1509042239860-f550ce710b93.jpg', 4, false),
  ('Pour-Over', 'Single-origin beans, brewed by hand, one cup at a time.', 5.00, 'hot', 'images/1442512595331-e89e73853f31.jpg', 5, false),
  ('Cold Brew', 'Steeped for 18 hours. Smooth, chocolatey and low in acid.', 4.75, 'cold', 'images/1517701604599-bb29b565090c.jpg', 6, false),
  ('House Blend Beans · 250 g', 'Our signature medium roast. Whole beans, roasted this week.', 12.00, 'beans', 'images/1559056199-641a0ac8b55e.jpg', 7, false)
) AS v(name, description, price, category, image, sort_order, featured)
WHERE NOT EXISTS (SELECT 1 FROM "products" p WHERE p."name" = v.name);
