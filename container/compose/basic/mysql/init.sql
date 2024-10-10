-- 创建新数据库 Keycloak
CREATE DATABASE keycloak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'keycloak'@'%' IDENTIFIED BY 'keycloak';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak'@'%';
-- 刷新权限
FLUSH PRIVILEGES;


-- 创建新数据库 Gitlab
CREATE DATABASE gitlab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'gitlab'@'%' IDENTIFIED BY 'gitlab';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON gitlab.* TO 'gitlab'@'%';
-- 刷新权限
FLUSH PRIVILEGES;


-- 创建新数据库 Outline
CREATE DATABASE outline CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'outline'@'%' IDENTIFIED BY 'outline';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON outline.* TO 'outline'@'%';
-- 刷新权限
FLUSH PRIVILEGES;


-- 创建新数据库 Readeck
CREATE DATABASE readeck CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'readeck'@'%' IDENTIFIED BY 'readeck';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON readeck.* TO 'readeck'@'%';
-- 刷新权限
FLUSH PRIVILEGES;


-- 创建新数据库 Nextcloud
CREATE DATABASE nextcloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建新用户
CREATE USER 'nextcloud'@'%' IDENTIFIED BY 'nextcloud';
-- 授予用户对新数据库的权限
GRANT ALL PRIVILEGES ON nextcloud.* TO 'nextcloud'@'%';
-- 刷新权限
FLUSH PRIVILEGES;
