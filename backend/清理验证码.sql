-- 清理过期的验证码记录（用于调试）

USE pickup_db;

-- 删除所有已使用的验证码
DELETE FROM sms_codes WHERE used = 1;

-- 删除所有过期的验证码
DELETE FROM sms_codes WHERE expires_at < NOW();

-- 查看剩余的验证码（可选）
-- SELECT * FROM sms_codes ORDER BY created_at DESC;

