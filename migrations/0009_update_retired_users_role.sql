-- 退職済みユーザーのroleをuserに設定
UPDATE `users` SET `role` = 'user' WHERE `is_retired` = 1;

