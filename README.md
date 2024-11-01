# Mouse Shop - Backend API

  - Dành cho team phát triển backend
  - Chứa API endpoints, database models, business logic

# Backend Developer workflow:
## 1. Tạo branch cho tính năng mới:
```
git checkout feature/backend
git pull origin feature/backend
git checkout -b feature/api/user-authentication
```

## 2. Sau khi code xong:
```
git add .
git commit -m "feat: implement user auth API"
git push origin feature/api/user-authentication
```

## 3. Tạo Pull Request vào feature/backend
## 4. Sau khi review và merge:
```
git checkout feature/backend
git pull origin feature/backend
```

## Tech Stack
- Python 3.10.*
- FastAPI
- MySQL
(tham khảo/tìm hiểu thêm)
- SQLAlchemy
- Alembic (migrations)
- PyJWT


## Cấu trúc Project

src/  
├── alembic/ # Database migrations  
├── app/  
│ ├── api/ # API endpoints  
│ ├── core/ # Cấu hình (Configurations)  
│ ├── crud/ # Điều hành cơ sở dữ liệu(CREATE, READ, UPDATE and DELETE)  
│ ├── db/ # Database setup  
│ ├── models/ # *SQLAlchemy models  
│ └── schemas/ # *Pydantic models  
└── tests/ # Chạy thử  
( *: tham khảo thêm)
