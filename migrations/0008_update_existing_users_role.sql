-- 既存ユーザーのroleをisRetiredに基づいて設定
UPDATE `users` SET `role` = 'admin' WHERE `is_retired` = 0;

