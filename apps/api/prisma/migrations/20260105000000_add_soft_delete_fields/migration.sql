-- Ensure deletedAt columns exist for soft deletes
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "UserRole" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "RolePermission" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "ModuleSubscription" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Create indexes to speed up soft-delete-aware queries
CREATE INDEX IF NOT EXISTS "Tenant_deletedAt_idx" ON "Tenant"("deletedAt");
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX IF NOT EXISTS "Role_deletedAt_idx" ON "Role"("deletedAt");
CREATE INDEX IF NOT EXISTS "Permission_deletedAt_idx" ON "Permission"("deletedAt");
CREATE INDEX IF NOT EXISTS "UserRole_deletedAt_idx" ON "UserRole"("deletedAt");
CREATE INDEX IF NOT EXISTS "RolePermission_deletedAt_idx" ON "RolePermission"("deletedAt");
CREATE INDEX IF NOT EXISTS "ModuleSubscription_deletedAt_idx" ON "ModuleSubscription"("deletedAt");
