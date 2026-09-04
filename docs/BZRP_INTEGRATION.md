# BZRP Integration notes

This file contains instructions and notes for integrating the BZRP / collaboration models into your existing Prisma schema and migration workflow.

Steps to integrate:
1. Open your main `prisma/schema.prisma` file.
2. Copy the models from `prisma/bzrp_models.prisma` and paste them into `schema.prisma` (inside the same datasource/schema block).
3. Run `npx prisma migrate dev --name bzrp_models` to create the migration.
4. Ensure `Message` and `User` and `Song` models exist and have compatible fields used by the new code (e.g. `message.metadata` as Json, `user.username`, `song.title`). Adjust code if your schema differs.

If you prefer, I can also update `schema.prisma` directly instead of providing this helper file; confirm if you want me to modify it in-place.
