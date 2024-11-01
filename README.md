# Mouse Shop - Frontend User

  - Dành cho thành viên phát triển giao diện người dùng
  - Chứa các components và pages cho user interface

# Frontend User Developer workflow:
## 1. Tạo branch cho tính năng mới:
```
git checkout feature/frontend-user
git pull origin feature/frontend-user
git checkout -b feature/user/login-page
```

## 2. Sau khi code xong:
```
git add .
git commit -m "feat: implement login page"
git push origin feature/user/login-page
```

## 3. Tạo Pull Request vào feature/frontend-user
## 4. Sau khi review và merge:
```
git checkout feature/frontend-user
git pull origin feature/frontend-user
```

# Tech Stack
(tham khảo)
- React 18
- React Router 6
- Axios
- TailwindCSS
- React Query
- Vite

# Cấu trúc thư mục

src/  
├─ components/ # Các thành phần có thể tái sử dụng  
├─ pages/ # Các thành phần của trang   
├─ hooks/ # Tùy chỉnh hooks  
├─ services/ # API services  
├─ utils/ # Helper functions  
├─ assets/ # Static assets  
└─ styles/ # Global styles  
