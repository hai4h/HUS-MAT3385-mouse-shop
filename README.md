# HUS-MAT3385-mouse-shop
Dự án này được thực hiện bởi người học dành cho môn học Cơ sở dữ liệu Web và hệ thống thông tin tại trường Khoa học Tự nhiên, Đại học Quốc gia Hà Nội (VNU-HUS)

# Lưu ý cho branch `main`

- Đây là branch chính, chứa code production
- Chỉ chứa code đã hoàn thiện, đã test kỹ và sẵn sàng để deploy
- KHÔNG AI được push trực tiếp vào main
- Code chỉ được merge vào main thông qua Pull Request từ branch develop
- Mỗi version trên main cần được tag với version number


# MouseX E-commerce

Hệ thống website bán chuột gaming trực tuyến.


## Tech Stack
- Design: Figma
- Frontend: ReactJS
- Backend: FastAPI
- Database: MySQL
- Containerization: Docker


## Cấu trúc Project
mouse-shop/

├─ design/ # Figma design files

├─ frontend-user/ # React app cho user interface

├─ frontend-admin/ # React app cho admin dashboard

├─ backend/ # FastAPI server

└─ docs/ # Documentation


## Yêu cầu hệ thống
- Docker và Docker Compose
- Node.js 16.x (cho development)
- Python 3.10.* (cho development)
- MySQL 8.0


## Khởi động với Docker
```
# Build và chạy toàn bộ hệ thống
docker-compose up --build

# Chạy riêng từng service
docker-compose up frontend-user
docker-compose up frontend-admin
docker-compose up backend
docker-compose up db
```

# Development Setup
## Frontend User
```
cd frontend-user
npm install
npm start
```

## Frontend Admin
```
cd frontend-admin
npm install
npm start
```

## Backend
```
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

# API Documentation
    (đang cập nhật)

# Team

- UI/UX Designer: Hoàng Đình Hải Anh  
- Frontend User Developer: Nguyễn Văn Khải  
- Frontend Admin Developer: Nguyễn Văn Chiến  
- Backend Developer: Nguyễn Văn Tuấn  

