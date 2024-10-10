-- 创建用户 Keycloak
CREATE USER keycloak WITH PASSWORD 'keycloak';
-- 创建数据库 Keycloak
CREATE DATABASE keycloak
	WITH OWNER = keycloak
	ENCODING = 'UTF8'
	TABLESPACE = pg_default
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8'
	CONNECTION LIMIT = -1
	TEMPLATE template0;
-- 设置数据库备注
COMMENT ON DATABASE keycloak IS 'Keycloak database';
-- 切换数据库
\c keycloak light;
-- 将用户权限赋予数据库
GRANT CONNECT, TEMPORARY ON DATABASE keycloak TO public;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO light;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO keycloak;
GRANT USAGE,CREATE ON SCHEMA public TO keycloak;
GRANT ALL ON SCHEMA public TO keycloak;
-- 授予创建数据库权限
ALTER ROLE keycloak CREATEDB;


-- 创建用户 Gitlab
CREATE USER gitlab WITH PASSWORD 'gitlab';
-- 创建数据库 Gitlab
CREATE DATABASE gitlab
	WITH OWNER = gitlab
	ENCODING = 'UTF8'
	TABLESPACE = pg_default
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8'
	CONNECTION LIMIT = -1
	TEMPLATE template0;
-- 设置数据库备注
COMMENT ON DATABASE gitlab IS 'Gitlab database';
-- 切换数据库
\c gitlab light;
-- 将用户权限赋予数据库
GRANT CONNECT, TEMPORARY ON DATABASE gitlab TO public;
GRANT ALL PRIVILEGES ON DATABASE gitlab TO gitlab;
GRANT ALL PRIVILEGES ON DATABASE gitlab TO light;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gitlab;
GRANT USAGE,CREATE ON SCHEMA public TO gitlab;
GRANT ALL ON SCHEMA public TO gitlab;
-- 授予创建数据库权限
ALTER ROLE gitlab CREATEDB;

-- 创建用户 Sonar
CREATE USER sonar WITH PASSWORD 'sonar';
-- 创建数据库 Sonar
CREATE DATABASE sonar
	WITH OWNER = sonar
	ENCODING = 'UTF8'
	TABLESPACE = pg_default
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8'
	CONNECTION LIMIT = -1
	TEMPLATE template0;
-- 设置数据库备注
COMMENT ON DATABASE sonar IS 'SonarQube database';
-- 切换数据库
\c sonar light;
-- 将用户权限赋予数据库
GRANT CONNECT, TEMPORARY ON DATABASE sonar TO public;
GRANT ALL PRIVILEGES ON DATABASE sonar TO sonar;
GRANT ALL PRIVILEGES ON DATABASE sonar TO light;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sonar;
GRANT USAGE,CREATE ON SCHEMA public TO sonar;
GRANT ALL ON SCHEMA public TO sonar;
-- 授予创建数据库权限
ALTER ROLE sonar CREATEDB;


-- 创建用户 Outline
CREATE USER outline WITH PASSWORD 'outline';
-- 创建数据库 Outline
CREATE DATABASE outline
	WITH OWNER = outline
	ENCODING = 'UTF8'
	TABLESPACE = pg_default
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8'
	CONNECTION LIMIT = -1
	TEMPLATE template0;
-- 设置数据库备注
COMMENT ON DATABASE outline IS 'Outline database';
-- 切换数据库
\c outline light;
-- 将用户权限赋予数据库
GRANT CONNECT, TEMPORARY ON DATABASE outline TO public;
GRANT ALL PRIVILEGES ON DATABASE outline TO outline;
GRANT ALL PRIVILEGES ON DATABASE outline TO light;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO outline;
GRANT USAGE,CREATE ON SCHEMA public TO outline;
GRANT ALL ON SCHEMA public TO outline;
-- 授予创建数据库权限
ALTER ROLE outline CREATEDB;


-- 创建用户 Readeck
CREATE USER readeck WITH PASSWORD 'readeck';
-- 创建数据库 Readeck
CREATE DATABASE readeck
	WITH OWNER = readeck
	ENCODING = 'UTF8'
	TABLESPACE = pg_default
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8'
	CONNECTION LIMIT = -1
	TEMPLATE template0;
-- 设置数据库备注
COMMENT ON DATABASE readeck IS 'Readeck database';
-- 切换数据库
\c readeck light;
-- 将用户权限赋予数据库
GRANT CONNECT, TEMPORARY ON DATABASE readeck TO public;
GRANT ALL PRIVILEGES ON DATABASE readeck TO readeck;
GRANT ALL PRIVILEGES ON DATABASE readeck TO light;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO readeck;
GRANT USAGE,CREATE ON SCHEMA public TO readeck;
GRANT ALL ON SCHEMA public TO readeck;
-- 授予创建数据库权限
ALTER ROLE readeck CREATEDB;

-- 创建用户 Nextcloud
CREATE USER nextcloud WITH PASSWORD 'nextcloud';
-- 创建数据库 Nextcloud
CREATE DATABASE nextcloud
	WITH OWNER = nextcloud
	ENCODING = 'UTF8'
	TABLESPACE = pg_default
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8'
	CONNECTION LIMIT = -1
	TEMPLATE template0;
-- 设置数据库备注
COMMENT ON DATABASE nextcloud IS 'Nextcloud database';
-- 切换数据库
\c nextcloud light;
-- 将用户权限赋予数据库
GRANT CONNECT, TEMPORARY ON DATABASE nextcloud TO public;
GRANT ALL PRIVILEGES ON DATABASE nextcloud TO nextcloud;
GRANT ALL PRIVILEGES ON DATABASE nextcloud TO light;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nextcloud;
GRANT USAGE,CREATE ON SCHEMA public TO nextcloud;
GRANT ALL ON SCHEMA public TO nextcloud;
-- 授予创建数据库权限
ALTER ROLE nextcloud CREATEDB;
