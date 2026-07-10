IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppConfig')
BEGIN
  CREATE TABLE [dbo].[AppConfig] (
    [id] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(MAX) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_AppConfig_updatedAt] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [AppConfig_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AppConfig_key_key] UNIQUE NONCLUSTERED ([key])
  );
END
