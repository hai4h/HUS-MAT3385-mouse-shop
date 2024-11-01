# Mouse Shop - Admin Dashboard

  - Dành cho team phát triển giao diện admin
  - Chứa các components và pages cho admin dashboard

# Frontend Admin Developer workflow:
## 1. Tạo branch cho tính năng mới:
```
git checkout feature/frontend-admin
git pull origin feature/frontend-admin
git checkout -b feature/admin/dashboard-analytics
```

## 2. Sau khi code xong:
```
git add .
git commit -m "feat: add dashboard analytics"
git push origin feature/admin/dashboard-analytics
```

## 3. Tạo Pull Request vào feature/frontend-admin
## 4. Sau khi review và merge:
```
git checkout feature/frontend-admin
git pull origin feature/frontend-admin
```

# Tech Stack
(tham khảo)
- React 18
- React Router 6
- Axios
- TailwindCSS
- React Query
- Vite
- React Table
- Chart.js

# Cấu trúc thư mục

src/  
├─ components/ # Các thành phần có thể tái sử dụng  
├─ pages/ # Các thành phần của trang   
├─ hooks/ # Tùy chỉnh hooks  
├─ services/ # API services  
├─ utils/ # Helper functions  
├─ assets/ # Static assets  
└─ styles/ # Global styles  
