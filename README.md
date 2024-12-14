# MouseX E-Commerce - BRANCH DEVELOP

  - Branch phát triển chính
  - Chứa code mới nhất đã được test sơ bộ
  - Là branch để integrate code từ các feature branches

# Quy trình chạy:

## Backend
```
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt # dành cho lần chạy đầu tiên
uvicorn src.main:app --reload
```

## Frontend User
```
cd frontend-user
npm install # dành cho lần chạy đầu tiên
npm start
```

## Frontend Admin
```
cd frontend-admin
npm install # dành cho lần chạy đầu tiên
npm start
```


