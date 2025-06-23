# MouseX E-Commerce

## 🚀 Kiến trúc Hệ thống

- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Cơ sở dữ liệu**: MySQL (Azure Database for MySQL)
- **Triển khai**: Docker, Azure App Service
- **Xác thực**: JWT

## 🔧 Cài đặt thiết yếu:

Trước khi bắt đầu, hãy đảm bảo bạn đã có sẵn:

- Docker
- Docker Compose
- Azure CLI(dành cho người dùng CLI)
- MySQL client
- Tài khoản GitHub
- Tài khoản Docker Hub

## 🛠️ Cài đặt Phát triển Cục bộ

### 1. Repository cloning

```bash
git clone https://github.com/hai4h/HUS-MAT3385-mouse-shop.git
cd HUS-MAT3385-mouse-shop
```

### 2. Cấu hình Môi trường

Tạo file `.env` trong thư mục gốc của dự án với các biến sau:

```env
# Database Configuration
DB_HOST=your-azure-mysql-server.mysql.database.azure.com
DB_USER=your_username
DB_PASSWORD=your_strong_password
DB_NAME=mouse_shop

# JWT Configuration
SECRET_KEY=your_long_random_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_TOKEN_EXPIRE_MINUTES=120
```

### 3. Phát triển ở máy cục bộ với Docker Compose

```bash
# Xây dựng và khởi động ứng dụng
docker-compose up --build

# Dừng ứng dụng
docker-compose down
```

## 🐳 Cấu hình Docker(trong repository)

## ☁️ Triển khai Azure (dành cho người dùng CLI, thao tác trên giao diện vui lòng truy cập https://portal.azure.com)

### 1. Thiết lập Azure Container Registry

```bash
# Đăng nhập Azure
az login

# Tạo Azure Container Registry
az acr create --resource-group MouseShopResourceGroup \
              --name mouseShopRegistry \
              --sku Basic

# Đăng nhập vào ACR
az acr login --name mouseShopRegistry
```

### 2. Xây dựng và Đẩy Docker Images lên Docker Hub

```bash
cd HUS-MAT3385-mouse-shop
docker-compose build --no-cache
docker push your-username/frontend-admin:latest
docker push your-username/frontend-user:latest
docker push your-username/backend:latest
```

### 3. Tạo Azure App Service(thực hiện cho từng docker image)

```bash
# Tạo App Service Plan
az appservice plan create --name MouseShopAppPlan \
                          --resource-group MouseShopResourceGroup \
                          --sku B1 \
                          --is-linux

# Tạo Web App
az webapp create --resource-group MouseShopResourceGroup \
                 --plan MouseShopAppPlan \
                 --name mouse-shop-app \
                 --deployment-container-image-name your-username/deployment-image-name:latest
```
### 4. Cấu Hình Cơ Sở Dữ Liệu (MySQL)
```bash
#Kết nối đến database
mysql -h <database-host>.mysql.database.azure.com -P 3306 -u <database-user> -p


#Nhập dữ liệu
mysql -h <database-host>.database.azure.com -P 3306 -u <database-user> -p <database-name> < <path-to-mouse_shop.sql>
```

## Quy trình sao lưu hệ thống
### 1. Cơ sở dữ liệu MySQL:
```bash
mysqldump -h <database-host>.database.azure.com -P 3306 -u <database-user> -p <database-name> > /path/to/backup/backup_$(date +%F).sql
```
### 2. Backend:
```bash
tar -czvf fastapi_backup_$(date +%F).tar.gz /path/to/backend/
```
### 3. Frontend:
```bash
tar -czvf react_admin_backup_$(date +%F).tar.gz /path/to/frontend-admin/build/
tar -czvf react_user_backup_$(date +%F).tar.gz /path/to/frontend-user/build/
```
### 4.Docker: Tạo bản sao cho các file .yaml nếu có

