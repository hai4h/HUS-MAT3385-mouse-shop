# MouseX E-Commerce - BRANCH DEVELOP

  - Branch phát triển chính
  - Chứa code mới nhất đã được test sơ bộ
  - Là branch để integrate code từ các feature branches
  - Design: https://www.figma.com/design/eTofuHOwW0teBn6bNZcGly/user-page?node-id=0-1&t=vsD6uPAYDJRCbkAp-1

# Quy trình chạy:

## Backend (port 8000)
```
cd backend
python -m venv venv # dành cho lần chạy đầu tiên
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt # dành cho lần chạy đầu tiên
uvicorn src.main:app --reload
```

## Frontend User (port 3000)
```
cd frontend-user
npm install # dành cho lần chạy đầu tiên
npm start
```

## Frontend Admin (port 3001)
```
cd frontend-admin
npm install # dành cho lần chạy đầu tiên
npm start
```


