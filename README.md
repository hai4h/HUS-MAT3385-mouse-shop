# Mouse Shop - Backend API

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
