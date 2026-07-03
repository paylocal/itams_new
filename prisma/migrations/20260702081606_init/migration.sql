BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'EMPLOYEE',
    [department] NVARCHAR(1000),
    [position] NVARCHAR(1000),
    [managerId] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[AssetRequest] (
    [id] NVARCHAR(1000) NOT NULL,
    [requestNumber] NVARCHAR(1000) NOT NULL,
    [requesterId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [reason] NVARCHAR(1000) NOT NULL,
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [AssetRequest_priority_df] DEFAULT 'NORMAL',
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [AssetRequest_status_df] DEFAULT 'DRAFT',
    [currentStep] INT NOT NULL CONSTRAINT [AssetRequest_currentStep_df] DEFAULT 1,
    [isLocked] BIT NOT NULL CONSTRAINT [AssetRequest_isLocked_df] DEFAULT 0,
    [totalAmount] DECIMAL(18,2),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssetRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [completedAt] DATETIME2,
    CONSTRAINT [AssetRequest_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AssetRequest_requestNumber_key] UNIQUE NONCLUSTERED ([requestNumber])
);

-- CreateTable
CREATE TABLE [dbo].[RequestItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [deviceModelId] NVARCHAR(1000),
    [customName] NVARCHAR(1000),
    [quantity] INT NOT NULL CONSTRAINT [RequestItem_quantity_df] DEFAULT 1,
    [unitPrice] DECIMAL(18,2),
    [totalPrice] DECIMAL(18,2),
    [specs] NVARCHAR(1000),
    CONSTRAINT [RequestItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ApprovalStep] (
    [id] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    [stepNumber] INT NOT NULL,
    [approverId] NVARCHAR(1000) NOT NULL,
    [decision] NVARCHAR(1000),
    [comment] NVARCHAR(1000),
    [decidedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ApprovalStep_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ApprovalStep_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ApprovalStep_requestId_stepNumber_key] UNIQUE NONCLUSTERED ([requestId],[stepNumber])
);

-- CreateTable
CREATE TABLE [dbo].[PurchaseOrder] (
    [id] NVARCHAR(1000) NOT NULL,
    [poNumber] NVARCHAR(1000) NOT NULL,
    [supplierName] NVARCHAR(1000) NOT NULL,
    [supplierContact] NVARCHAR(1000),
    [supplierPhone] NVARCHAR(1000),
    [supplierId] NVARCHAR(1000),
    [orderDate] DATETIME2 NOT NULL CONSTRAINT [PurchaseOrder_orderDate_df] DEFAULT CURRENT_TIMESTAMP,
    [expectedDate] DATETIME2,
    [actualDate] DATETIME2,
    [totalAmount] DECIMAL(18,2) NOT NULL,
    [poDocument] NVARCHAR(1000),
    [invoiceDocument] NVARCHAR(1000),
    [notes] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [PurchaseOrder_status_df] DEFAULT 'DRAFT',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PurchaseOrder_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PurchaseOrder_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PurchaseOrder_poNumber_key] UNIQUE NONCLUSTERED ([poNumber])
);

-- CreateTable
CREATE TABLE [dbo].[PurchaseOrderRequest] (
    [id] NVARCHAR(1000) NOT NULL,
    [purchaseOrderId] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PurchaseOrderRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PurchaseOrderRequest_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PurchaseOrderRequest_purchaseOrderId_requestId_key] UNIQUE NONCLUSTERED ([purchaseOrderId],[requestId])
);

-- CreateTable
CREATE TABLE [dbo].[POItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [poId] NVARCHAR(1000) NOT NULL,
    [requestItemId] NVARCHAR(1000),
    [productName] NVARCHAR(1000) NOT NULL,
    [quantity] INT NOT NULL CONSTRAINT [POItem_quantity_df] DEFAULT 1,
    [unitPrice] DECIMAL(18,2) NOT NULL,
    [totalPrice] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [POItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Asset] (
    [id] NVARCHAR(1000) NOT NULL,
    [assetTag] NVARCHAR(1000) NOT NULL,
    [qrCode] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [brand] NVARCHAR(1000),
    [model] NVARCHAR(1000),
    [serialNumber] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Asset_status_df] DEFAULT 'NEW',
    [requestId] NVARCHAR(1000),
    [purchaseOrderId] NVARCHAR(1000),
    [currentHolderId] NVARCHAR(1000),
    [assignedDate] DATETIME2,
    [location] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Asset_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Asset_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Asset_assetTag_key] UNIQUE NONCLUSTERED ([assetTag]),
    CONSTRAINT [Asset_qrCode_key] UNIQUE NONCLUSTERED ([qrCode])
);

-- CreateTable
CREATE TABLE [dbo].[AssetHistory] (
    [id] NVARCHAR(1000) NOT NULL,
    [assetId] NVARCHAR(1000) NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [toUserId] NVARCHAR(1000),
    [performedBy] NVARCHAR(1000) NOT NULL,
    [notes] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AssetHistory_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AssetHistory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Handover] (
    [id] NVARCHAR(1000) NOT NULL,
    [handoverNumber] NVARCHAR(1000) NOT NULL,
    [requestId] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [itStaffId] NVARCHAR(1000) NOT NULL,
    [employeeSignature] NVARCHAR(1000),
    [employeeSignedAt] DATETIME2,
    [itSignature] NVARCHAR(1000),
    [itSignedAt] DATETIME2,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Handover_status_df] DEFAULT 'PENDING_EMPLOYEE_SIGN',
    [handoverDate] DATETIME2 NOT NULL,
    [pdfUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Handover_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Handover_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Handover_handoverNumber_key] UNIQUE NONCLUSTERED ([handoverNumber])
);

-- CreateTable
CREATE TABLE [dbo].[HandoverItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [handoverId] NVARCHAR(1000) NOT NULL,
    [assetId] NVARCHAR(1000) NOT NULL,
    [condition] NVARCHAR(1000),
    CONSTRAINT [HandoverItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DeviceCategory] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hasModel] BIT NOT NULL CONSTRAINT [DeviceCategory_hasModel_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [DeviceCategory_isActive_df] DEFAULT 1,
    [order] INT NOT NULL CONSTRAINT [DeviceCategory_order_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DeviceCategory_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DeviceCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DeviceCategory_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[DeviceModel] (
    [id] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [brand] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [avgPrice] DECIMAL(18,2),
    [isActive] BIT NOT NULL CONSTRAINT [DeviceModel_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DeviceModel_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DeviceModel_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Supplier] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [contactName] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    [taxCode] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [Supplier_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Supplier_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Supplier_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Supplier_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Language] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [flag] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [Language_isActive_df] DEFAULT 1,
    [isDefault] BIT NOT NULL CONSTRAINT [Language_isDefault_df] DEFAULT 0,
    [order] INT NOT NULL CONSTRAINT [Language_order_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Language_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Language_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Language_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Translation] (
    [id] NVARCHAR(1000) NOT NULL,
    [languageId] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000),
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Translation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Translation_languageId_key_key] UNIQUE NONCLUSTERED ([languageId],[key])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [userName] NVARCHAR(1000) NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [entity] NVARCHAR(1000) NOT NULL,
    [entityId] NVARCHAR(1000) NOT NULL,
    [oldData] NVARCHAR(1000),
    [newData] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[SLAConfig] (
    [id] NVARCHAR(1000) NOT NULL,
    [stepName] NVARCHAR(1000) NOT NULL,
    [hoursToApprove] INT NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [SLAConfig_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [SLAConfig_stepName_key] UNIQUE NONCLUSTERED ([stepName])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_managerId_fkey] FOREIGN KEY ([managerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssetRequest] ADD CONSTRAINT [AssetRequest_requesterId_fkey] FOREIGN KEY ([requesterId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestItem] ADD CONSTRAINT [RequestItem_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[AssetRequest]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequestItem] ADD CONSTRAINT [RequestItem_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[DeviceCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RequestItem] ADD CONSTRAINT [RequestItem_deviceModelId_fkey] FOREIGN KEY ([deviceModelId]) REFERENCES [dbo].[DeviceModel]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ApprovalStep] ADD CONSTRAINT [ApprovalStep_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[AssetRequest]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ApprovalStep] ADD CONSTRAINT [ApprovalStep_approverId_fkey] FOREIGN KEY ([approverId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PurchaseOrder] ADD CONSTRAINT [PurchaseOrder_supplierId_fkey] FOREIGN KEY ([supplierId]) REFERENCES [dbo].[Supplier]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PurchaseOrderRequest] ADD CONSTRAINT [PurchaseOrderRequest_purchaseOrderId_fkey] FOREIGN KEY ([purchaseOrderId]) REFERENCES [dbo].[PurchaseOrder]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PurchaseOrderRequest] ADD CONSTRAINT [PurchaseOrderRequest_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[AssetRequest]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[POItem] ADD CONSTRAINT [POItem_poId_fkey] FOREIGN KEY ([poId]) REFERENCES [dbo].[PurchaseOrder]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[POItem] ADD CONSTRAINT [POItem_requestItemId_fkey] FOREIGN KEY ([requestItemId]) REFERENCES [dbo].[RequestItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Asset] ADD CONSTRAINT [Asset_requestId_fkey] FOREIGN KEY ([requestId]) REFERENCES [dbo].[AssetRequest]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Asset] ADD CONSTRAINT [Asset_purchaseOrderId_fkey] FOREIGN KEY ([purchaseOrderId]) REFERENCES [dbo].[PurchaseOrder]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Asset] ADD CONSTRAINT [Asset_currentHolderId_fkey] FOREIGN KEY ([currentHolderId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AssetHistory] ADD CONSTRAINT [AssetHistory_assetId_fkey] FOREIGN KEY ([assetId]) REFERENCES [dbo].[Asset]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Handover] ADD CONSTRAINT [Handover_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Handover] ADD CONSTRAINT [Handover_itStaffId_fkey] FOREIGN KEY ([itStaffId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HandoverItem] ADD CONSTRAINT [HandoverItem_handoverId_fkey] FOREIGN KEY ([handoverId]) REFERENCES [dbo].[Handover]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[HandoverItem] ADD CONSTRAINT [HandoverItem_assetId_fkey] FOREIGN KEY ([assetId]) REFERENCES [dbo].[Asset]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DeviceModel] ADD CONSTRAINT [DeviceModel_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[DeviceCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Translation] ADD CONSTRAINT [Translation_languageId_fkey] FOREIGN KEY ([languageId]) REFERENCES [dbo].[Language]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
