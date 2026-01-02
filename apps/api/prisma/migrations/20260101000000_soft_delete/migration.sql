-- Add deletedAt columns for soft deletes
ALTER TABLE "Tenant" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Role" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Permission" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "UserRole" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "RolePermission" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "ModuleSubscription" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Indexes to support filtering non-deleted records
CREATE INDEX "Tenant_deletedAt_idx" ON "Tenant"("deletedAt");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "Role_deletedAt_idx" ON "Role"("deletedAt");
CREATE INDEX "Permission_deletedAt_idx" ON "Permission"("deletedAt");
CREATE INDEX "UserRole_deletedAt_idx" ON "UserRole"("deletedAt");
CREATE INDEX "RolePermission_deletedAt_idx" ON "RolePermission"("deletedAt");
CREATE INDEX "ModuleSubscription_deletedAt_idx" ON "ModuleSubscription"("deletedAt");
