-- Manual migration script for new password policy, workflow, asset fields, and supplier relation

-- Helper: determine User.id length for FK consistency
DECLARE @userIdLen INT;
SELECT @userIdLen = CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'User' AND COLUMN_NAME = 'id';
IF @userIdLen IS NULL SET @userIdLen = 1000;

-- 1. PasswordPolicy table
IF OBJECT_ID('dbo.PasswordPolicy', 'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[PasswordPolicy] (
    [id] NVARCHAR(450) NOT NULL,
    [minLength] INT NOT NULL DEFAULT 8,
    [requireUppercase] BIT NOT NULL DEFAULT 1,
    [requireLowercase] BIT NOT NULL DEFAULT 1,
    [requireNumber] BIT NOT NULL DEFAULT 1,
    [requireSpecial] BIT NOT NULL DEFAULT 1,
    [passwordExpiryDays] INT NOT NULL DEFAULT 90,
    [preventReuseCount] INT NOT NULL DEFAULT 3,
    [lockoutAfterFailedAttempts] INT NULL DEFAULT 5,
    [isActive] BIT NOT NULL DEFAULT 1,
    [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_PasswordPolicy] PRIMARY KEY CLUSTERED ([id])
  );
END

-- 2. PasswordHistory table
IF OBJECT_ID('dbo.PasswordHistory', 'U') IS NULL
BEGIN
  DECLARE @sql NVARCHAR(MAX);
  SET @sql = N'CREATE TABLE [dbo].[PasswordHistory] (
    [id] NVARCHAR(450) NOT NULL,
    [userId] NVARCHAR(' + CAST(@userIdLen AS NVARCHAR(10)) + N') NOT NULL,
    [passwordHash] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_PasswordHistory] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FK_PasswordHistory_User] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE
  );';
  EXEC sp_executesql @sql;
END

-- 3. Add User.lastPasswordChangeAt and mustChangePassword
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.User') AND name = 'lastPasswordChangeAt')
BEGIN
  ALTER TABLE [dbo].[User] ADD [lastPasswordChangeAt] DATETIME2 NOT NULL DEFAULT GETDATE();
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.User') AND name = 'mustChangePassword')
BEGIN
  ALTER TABLE [dbo].[User] ADD [mustChangePassword] BIT NOT NULL DEFAULT 0;
END

-- 4. Add AssetRequest.totalAmountUsd
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.AssetRequest') AND name = 'totalAmountUsd')
BEGIN
  ALTER TABLE [dbo].[AssetRequest] ADD [totalAmountUsd] DECIMAL(18,2) NULL;
END

-- 5. Ensure UserGroup has PK and unique code
IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('dbo.UserGroup') AND type = 'PK')
BEGIN
  ALTER TABLE [dbo].[UserGroup] ADD CONSTRAINT [PK_UserGroup] PRIMARY KEY CLUSTERED ([id]);
END
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.UserGroup') AND name = 'UQ_UserGroup_code' AND is_unique = 1)
BEGIN
  ALTER TABLE [dbo].[UserGroup] ADD CONSTRAINT [UQ_UserGroup_code] UNIQUE ([code]);
END

-- 6. Add UserGroup.managesLevel
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.UserGroup') AND name = 'managesLevel')
BEGIN
  ALTER TABLE [dbo].[UserGroup] ADD [managesLevel] INT NULL;
END

-- Determine referenced column lengths
DECLARE @userGroupIdLen INT, @supplierIdLen INT, @assetRequestIdLen INT;
SELECT @userGroupIdLen = CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserGroup' AND COLUMN_NAME = 'id';
SELECT @supplierIdLen = CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Supplier' AND COLUMN_NAME = 'id';
SELECT @assetRequestIdLen = CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AssetRequest' AND COLUMN_NAME = 'id';
IF @userGroupIdLen IS NULL SET @userGroupIdLen = 191;
IF @supplierIdLen IS NULL SET @supplierIdLen = 191;
IF @assetRequestIdLen IS NULL SET @assetRequestIdLen = 191;

-- 7. Create WorkflowRule table if missing
IF OBJECT_ID('dbo.WorkflowRule', 'U') IS NULL
BEGIN
  DECLARE @wrSql NVARCHAR(MAX);
  SET @wrSql = N'CREATE TABLE [dbo].[WorkflowRule] (
    [id] NVARCHAR(450) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NULL,
    [conditionType] NVARCHAR(1000) NOT NULL,
    [operator] NVARCHAR(1000) NOT NULL,
    [value] DECIMAL(18,2) NOT NULL,
    [category] NVARCHAR(1000) NULL,
    [priority] NVARCHAR(1000) NULL,
    [requiredGroupId] NVARCHAR(' + CAST(@userGroupIdLen AS NVARCHAR(10)) + N') NULL,
    [requiredLevel] INT NOT NULL DEFAULT 1,
    [isActive] BIT NOT NULL DEFAULT 1,
    [order] INT NOT NULL DEFAULT 0,
    [groupId] NVARCHAR(' + CAST(@userGroupIdLen AS NVARCHAR(10)) + N') NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_WorkflowRule] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FK_WorkflowRule_UserGroup] FOREIGN KEY ([groupId]) REFERENCES [dbo].[UserGroup]([id])
  );';
  EXEC sp_executesql @wrSql;
END

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowRule')
  AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.WorkflowRule') AND name = 'requiredGroupId')
BEGIN
  DECLARE @addReq NVARCHAR(MAX);
  SET @addReq = N'ALTER TABLE [dbo].[WorkflowRule] ADD [requiredGroupId] NVARCHAR(' + CAST(@userGroupIdLen AS NVARCHAR(10)) + N') NULL;';
  EXEC sp_executesql @addReq;
END

-- 8. Ensure UserGroupMember has PK and unique (groupId, userId)
IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('dbo.UserGroupMember') AND type = 'PK')
BEGIN
  ALTER TABLE [dbo].[UserGroupMember] ADD CONSTRAINT [PK_UserGroupMember] PRIMARY KEY CLUSTERED ([id]);
END
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.UserGroupMember') AND name = 'UQ_UserGroupMember_group_user' AND is_unique = 1)
BEGIN
  ALTER TABLE [dbo].[UserGroupMember] ADD CONSTRAINT [UQ_UserGroupMember_group_user] UNIQUE ([groupId], [userId]);
END

-- 9. Add POItem.requestId
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.POItem') AND name = 'requestId')
BEGIN
  DECLARE @addPoReq NVARCHAR(MAX);
  SET @addPoReq = N'ALTER TABLE [dbo].[POItem] ADD [requestId] NVARCHAR(' + CAST(@assetRequestIdLen AS NVARCHAR(10)) + N') NULL;';
  EXEC sp_executesql @addPoReq;
END

-- 10. Add Asset.notes and receivedDate
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Asset') AND name = 'notes')
BEGIN
  ALTER TABLE [dbo].[Asset] ADD [notes] NVARCHAR(1000) NULL;
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Asset') AND name = 'receivedDate')
BEGIN
  ALTER TABLE [dbo].[Asset] ADD [receivedDate] DATETIME2 NULL;
END

-- 11. Add PurchaseOrder.supplierId and FK
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.PurchaseOrder') AND name = 'supplierId')
BEGIN
  DECLARE @addSup NVARCHAR(MAX);
  SET @addSup = N'ALTER TABLE [dbo].[PurchaseOrder] ADD [supplierId] NVARCHAR(' + CAST(@supplierIdLen AS NVARCHAR(10)) + N') NULL;';
  EXEC sp_executesql @addSup;
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PurchaseOrder_Supplier')
BEGIN
  ALTER TABLE [dbo].[PurchaseOrder] ADD CONSTRAINT [FK_PurchaseOrder_Supplier]
    FOREIGN KEY ([supplierId]) REFERENCES [dbo].[Supplier]([id]);
END

-- 12. Drop old UserGroupFlow table if exists
IF OBJECT_ID('dbo.UserGroupFlow', 'U') IS NOT NULL
BEGIN
  DROP TABLE [dbo].[UserGroupFlow];
END

-- 13. Update status values to use new PENDING_BOD / PENDING_STOCK_CHECK if old statuses exist
UPDATE [dbo].[AssetRequest] SET [status] = 'PENDING_BOD' WHERE [status] = 'PENDING_ADMIN';
